// src/orders/orders.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VnpayService } from '../payment/vnpay.service';
import {
  addresses,
  customers,
  order_detail,
  orders,
  payments,
  Prisma,
  product_variants,
  vouchers,
} from '@prisma/client';
import { format } from 'date-fns/format';
import { UpdateOrderStatusDto } from './dtos/update-order-status';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpayService: VnpayService,
    private readonly mail: MailService,
  ) {}

  /**
   * ============================================
   * CREATE ORDER WITH VOUCHER & PRICE VERIFICATION
   * ============================================
   */
  async createOrder(dto: CreateOrderDto, customerId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      let calculatedSubtotal = new Prisma.Decimal(0);
      const variantDetails: Array<{
        variant_id: number;
        quantity: number;
        unit_price: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }> = [];

      for (const item of dto.items) {
        const variant = await tx.product_variants.findUnique({
          where: { variant_id: item.variantId },
          select: {
            variant_id: true,
            quantity: true,
            base_price: true,
            status: true,
            sku: true,
            products: { select: { product_name: true } },
          },
        });

        if (!variant || !variant.status) {
          throw new BadRequestException(
            `Sản phẩm ${variant?.sku || item.variantId} không còn kinh doanh`,
          );
        }

        if (variant.quantity < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${variant.products?.product_name || variant.sku} không đủ hàng. Còn lại: ${variant.quantity}, yêu cầu: ${item.quantity}`,
          );
        }

        const unitPrice = variant.base_price ?? new Prisma.Decimal(0);
        const subtotal = unitPrice.mul(item.quantity);
        calculatedSubtotal = calculatedSubtotal.add(subtotal);

        variantDetails.push({
          variant_id: variant.variant_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal,
        });
      }

      // Xử lý voucher
      let discountAmount = new Prisma.Decimal(0);
      let voucherId: number | null = null;

      if (dto.voucherId) {
        const voucher = await tx.vouchers.findUnique({
          where: { voucher_id: dto.voucherId },
        });

        if (!voucher || !voucher.status) {
          throw new BadRequestException('Mã giảm giá không hợp lệ');
        }

        const now = new Date();
        if (voucher.start_date && now < voucher.start_date) {
          throw new BadRequestException('Mã giảm giá chưa đến thời gian sử dụng');
        }
        if (voucher.end_date && now > voucher.end_date) {
          throw new BadRequestException('Mã giảm giá đã hết hạn');
        }

        if (voucher.quantity <= voucher.used_count) {
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
        }

        if (calculatedSubtotal.toNumber() < voucher.min_order_value.toNumber()) {
          throw new BadRequestException(
            `Đơn hàng phải có giá trị tối thiểu ${voucher.min_order_value.toNumber().toLocaleString('vi-VN')}₫ để sử dụng mã này`,
          );
        }

        if (voucher.discount_type === 'percentage') {
          discountAmount = calculatedSubtotal.mul(voucher.discount_value.toNumber()).div(100);
          const maxDiscount = voucher.max_discount.toNumber();
          if (discountAmount.toNumber() > maxDiscount) {
            discountAmount = new Prisma.Decimal(maxDiscount);
          }
        } else {
          discountAmount = voucher.discount_value;
        }

        if (discountAmount.greaterThan(calculatedSubtotal)) {
          discountAmount = calculatedSubtotal;
        }

        await tx.vouchers.update({
          where: { voucher_id: voucher.voucher_id },
          data: { used_count: { increment: 1 } },
        });

        voucherId = voucher.voucher_id;
      }

      const shippingFee = new Prisma.Decimal(30000);
      const totalPrice = calculatedSubtotal.sub(discountAmount).add(shippingFee);

      if (Math.abs(totalPrice.toNumber() - dto.totalPrice) > 1000) {
        throw new BadRequestException('Giá trị đơn hàng không hợp lệ, vui lòng thử lại');
      }

      const order = await tx.orders.create({
        data: {
          customer_id: customerId,
          address_id: dto.addressId,
          subtotal_price: calculatedSubtotal,
          discount_price: discountAmount,
          total_price: totalPrice,
          shipping_fee: shippingFee,
          order_status: 'pending',
          payment_status: 'pending',
          voucher_id: voucherId,
        },
      });

      for (const vd of variantDetails) {
        await tx.order_detail.create({
          data: {
            order_id: order.order_id,
            variant_id: vd.variant_id,
            quantity: vd.quantity,
            total_price: vd.subtotal,
          },
        });

        await tx.inventory_transactions.create({
          data: {
            variant_id: vd.variant_id,
            change_quantity: -vd.quantity,
            reason: 'customer_order',
            order_id: order.order_id,
          },
        });

        await tx.product_variants.update({
          where: { variant_id: vd.variant_id },
          data: { quantity: { decrement: vd.quantity } },
        });
      }

      const cart = await tx.cart.findFirst({
        where: { customer_id: customerId },
        select: { cart_id: true },
      });

      if (cart) {
        const variantIds = dto.items.map((i) => i.variantId);
        await tx.cart_detail.deleteMany({
          where: { cart_id: cart.cart_id, variant_id: { in: variantIds } },
        });

        const remaining = await tx.cart_detail.findMany({
          where: { cart_id: cart.cart_id },
          include: { product_variants: true },
        });

        let newTotal = new Prisma.Decimal(0);
        for (const d of remaining) {
          const price = d.product_variants?.base_price ?? new Prisma.Decimal(0);
          newTotal = newTotal.add(price.mul(d.quantity));
        }

        await tx.cart.update({
          where: { cart_id: cart.cart_id },
          data: { total_price: newTotal },
        });
      }

      const txId = 'TX-' + Date.now();
      const payment = await tx.payments.create({
        data: {
          order_id: order.order_id,
          method: 'VNPAY_QR',
          status: 'pending',
          transaction_id: txId,
          amount: totalPrice,
        },
      });

      return { order, variantDetails, totalPrice, payment, txId };
    });

    // Gửi email
    try {
      const customer = await this.prisma.customers.findUnique({
        where: { customer_id: customerId },
        select: { user_id: true },
      });

      if (!customer) throw new NotFoundException('Customer not found');

      const user = await this.prisma.users.findUnique({
        where: { user_id: customer.user_id },
        select: { email: true, full_name: true },
      });

      if (user?.email) {
        const itemsWithName = await Promise.all(
          result.variantDetails.map(async (vd) => {
            const variant = await this.prisma.product_variants.findUnique({
              where: { variant_id: vd.variant_id },
              select: { products: { select: { product_name: true } } },
            });
            return {
              product_name: variant?.products?.product_name || 'Unknown',
              quantity: vd.quantity,
              unit_price: vd.unit_price.toNumber(),
              subtotal: vd.subtotal.toNumber(),
            };
          }),
        );

        await this.mail.sendInvoice(
          user.email,
          user.full_name,
          result.order,
          itemsWithName,
          result.totalPrice.toNumber(),
        );
      }
    } catch (err) {
      this.logger.error('Failed to send order email', err);
    }

    const qrUrl = this.vnpayService.generatePaymentUrl({
      orderId: result.order.order_id,
      amount: result.totalPrice.toNumber(),
      txnRef: result.txId,
    });

    return {
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      order: {
        order_id: result.order.order_id,
        total_price: result.totalPrice.toNumber(),
        order_status: result.order.order_status,
        payment_status: result.order.payment_status,
        created_at: result.order.created_at,
      },
      payment: {
        payment_id: result.payment.payment_id,
        transaction_id: result.payment.transaction_id,
        amount: result.totalPrice.toNumber(),
        qrUrl,
      },
    };
  }

  // ADMIN: lấy tất cả orders (kèm toàn bộ quan hệ cần dùng)
  async findAll() {
    const data = await this.prisma.orders.findMany({
      orderBy: { order_id: 'desc' },
      include: {
        customers: true,
        addresses: true,
        vouchers: true,
        order_detail: {
          include: {
            product_variants: {
              include: {
                products: true,
                variant_assets: true,
              },
            },
          },
        },
        payments: true,
      },
    });
    return data.map((o) => this.transformOrderFull(o));
  }

  // ADMIN: lấy 1 order theo id
  async getOrderById(orderId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { order_id: orderId },
      include: {
        customers: true,
        addresses: true,
        vouchers: true,
        order_detail: {
          include: {
            product_variants: {
              include: {
                products: true,
                variant_assets: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return this.transformOrderFull(order);
  }

  // CUSTOMER: lấy orders theo userId (map user → customer → orders)
  async getOrdersByUserId(userId: number) {
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
      select: { customer_id: true },
    });
    if (!customer) return [];

    const data = await this.prisma.orders.findMany({
      where: { customer_id: customer.customer_id },
      orderBy: { order_id: 'desc' },
      include: {
        customers: true,
        addresses: true,
        vouchers: true,
        order_detail: {
          include: {
            product_variants: {
              include: {
                products: true,
                variant_assets: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    return data.map((o) => this.transformOrderFull(o));
  }

  // src/orders/orders.service.ts

  /**
   * Cập nhật trạng thái đơn hàng (Admin) - FIX TYPESCRIPT ERRORS
   */
  async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto, adminUserId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Kiểm tra đơn hàng tồn tại
      const order = await tx.orders.findUnique({
        where: { order_id: orderId },
        include: {
          order_detail: {
            include: {
              product_variants: {
                select: {
                  variant_id: true,
                  sku: true,
                  quantity: true,
                },
              },
            },
          },
          payments: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Đơn hàng #${orderId} không tồn tại`);
      }

      // 2️⃣ Kiểm tra trạng thái trùng
      if (order.order_status === dto.orderStatus) {
        throw new BadRequestException(
          `Đơn hàng hiện tại đã ở trạng thái "${this.getStatusLabel(dto.orderStatus)}" rồi`,
        );
      }

      // 3️⃣ Kiểm tra đơn hàng đã hoàn thành hoặc đã huỷ
      if (order.order_status === 'completed') {
        throw new BadRequestException('Không thể cập nhật đơn hàng đã hoàn thành');
      }

      if (order.order_status === 'cancelled' && dto.orderStatus !== 'cancelled') {
        throw new BadRequestException('Không thể cập nhật đơn hàng đã bị huỷ');
      }

      if (order.order_status === 'returned' && dto.orderStatus !== 'returned') {
        throw new BadRequestException('Không thể cập nhật đơn hàng đã bị hoàn trả');
      }

      // 4️⃣ Kiểm tra thanh toán trước khi chuyển sang shipping
      if (dto.orderStatus === 'shipping' && order.payment_status !== 'paid') {
        throw new BadRequestException(
          'Không thể chuyển sang trạng thái giao hàng khi đơn hàng chưa thanh toán. Vui lòng xác nhận thanh toán trước.',
        );
      }

      // 5️⃣ Kiểm tra logic chuyển trạng thái hợp lệ
      this.validateStatusTransition(order.order_status, dto.orderStatus);

      // 6️⃣ Kiểm tra payment_status trùng (nếu có truyền)
      if (dto.paymentStatus && order.payment_status === dto.paymentStatus) {
        throw new BadRequestException(
          `Trạng thái thanh toán hiện tại đã là "${this.getPaymentStatusLabel(dto.paymentStatus)}" rồi`,
        );
      }

      // 7️⃣ Xử lý huỷ đơn hàng - hoàn kho + hoàn voucher
      if (dto.orderStatus === 'cancelled' && order.order_status !== 'cancelled') {
        await this.handleOrderCancellation(tx, order);
      }

      // 8️⃣ Xử lý hoàn trả (khách không nhận hàng)
      if (dto.orderStatus === 'returned' && order.order_status !== 'returned') {
        await this.handleOrderReturn(tx, order);
      }

      // 9️⃣ Cập nhật trạng thái đơn hàng
      const updatedOrder = await tx.orders.update({
        where: { order_id: orderId },
        data: {
          order_status: dto.orderStatus,
          payment_status: dto.paymentStatus ?? order.payment_status,
          note: dto.note ?? order.note,
        },
      });

      // 🔟 Ghi lịch sử thay đổi
      await tx.order_status_history.create({
        data: {
          order_id: orderId,
          user_id: adminUserId,
          status: dto.orderStatus,
        },
      });

      // 1️⃣1️⃣ Ghi audit log
      await tx.audit_logs.create({
        data: {
          user_id: adminUserId,
          action: 'UPDATE_ORDER_STATUS',
          entity_type: 'orders',
          entity_id: orderId,
          details: {
            old_status: order.order_status,
            new_status: dto.orderStatus,
            old_payment_status: order.payment_status,
            new_payment_status: dto.paymentStatus ?? order.payment_status,
            note: dto.note,
          },
        },
      });

      return {
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        order: this.transformOrder(updatedOrder),
      };
    });
  }

  /**
   * Lấy label tiếng Việt cho payment status
   */
  private getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
      refunded: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  }

  /**
   * Validate logic chuyển trạng thái - CẬP NHẬT ĐẦY ĐỦ
   */
  private validateStatusTransition(currentStatus: string, newStatus: string) {
    // Mapping trạng thái được phép chuyển
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'], // Chờ xác nhận → Xác nhận hoặc Huỷ
      confirmed: ['processing', 'cancelled'], // Đã xác nhận → Xử lý hoặc Huỷ
      processing: ['shipping', 'cancelled'], // Đang xử lý → Giao hàng hoặc Huỷ (KHÔNG về confirmed)
      shipping: ['delivered', 'returned', 'cancelled'], // Đang giao → Đã giao, Hoàn trả hoặc Huỷ (KHÔNG về processing)
      delivered: ['completed'], // Đã giao → Hoàn thành (KHÔNG cập nhật được nữa ngoài này)
      completed: [], // Hoàn thành → KHÔNG cho phép thay đổi
      cancelled: [], // Đã huỷ → KHÔNG cho phép thay đổi
      returned: [], // Hoàn trả → KHÔNG cho phép thay đổi
    };

    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      // Tạo message chi tiết dựa vào từng trường hợp
      let errorMessage = '';

      if (currentStatus === 'completed') {
        errorMessage = 'Đơn hàng đã hoàn thành, không thể thay đổi trạng thái';
      } else if (currentStatus === 'cancelled') {
        errorMessage = 'Đơn hàng đã bị huỷ, không thể thay đổi trạng thái';
      } else if (currentStatus === 'returned') {
        errorMessage = 'Đơn hàng đã bị hoàn trả, không thể thay đổi trạng thái';
      } else if (currentStatus === 'processing' && newStatus === 'confirmed') {
        errorMessage = 'Không thể chuyển ngược từ "Đang xử lý" về "Đã xác nhận"';
      } else if (currentStatus === 'shipping' && newStatus === 'processing') {
        errorMessage = 'Không thể chuyển ngược từ "Đang giao hàng" về "Đang xử lý"';
      } else if (currentStatus === 'shipping' && newStatus === 'cancelled') {
        errorMessage =
          'Đơn hàng đang giao không thể huỷ. Vui lòng chọn "Hoàn trả" nếu khách không nhận hàng';
      } else if (currentStatus === 'delivered' && newStatus !== 'completed') {
        errorMessage = 'Đơn hàng đã giao chỉ có thể chuyển sang "Hoàn thành"';
      } else {
        errorMessage = `Không thể chuyển từ trạng thái "${this.getStatusLabel(currentStatus)}" sang "${this.getStatusLabel(newStatus)}"`;
      }

      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Lấy label tiếng Việt cho status
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã huỷ',
      returned: 'Hoàn trả',
    };
    return labels[status] || status;
  }

  /**
   * Xử lý huỷ đơn hàng
   */
  private async handleOrderCancellation(tx: any, order: any) {
    // 1️⃣ Hoàn kho
    for (const detail of order.order_detail) {
      // Ghi inventory transaction (nhập kho lại)
      await tx.inventory_transactions.create({
        data: {
          variant_id: detail.variant_id,
          change_quantity: detail.quantity, // Dương = nhập kho
          reason: 'order_cancelled',
          order_id: order.order_id,
        },
      });

      // Cộng lại tồn kho
      await tx.product_variants.update({
        where: { variant_id: detail.variant_id },
        data: { quantity: { increment: detail.quantity } },
      });
    }

    // 2️⃣ Hoàn voucher (nếu có)
    if (order.voucher_id) {
      await tx.vouchers.update({
        where: { voucher_id: order.voucher_id },
        data: { used_count: { decrement: 1 } },
      });
    }

    // 3️⃣ Cập nhật payment status nếu đã thanh toán
    if (order.payment_status === 'paid') {
      await tx.payments.updateMany({
        where: { order_id: order.order_id },
        data: { status: 'refunded' },
      });
    }
  }

  /**
   * Xử lý hoàn trả (khách không nhận hàng)
   */
  private async handleOrderReturn(tx: any, order: any) {
    // Giống như cancel, nhưng có thể có logic khác
    // Ví dụ: tính phí hoàn trả, ghi chú khác

    // 1️⃣ Hoàn kho
    for (const detail of order.order_detail) {
      await tx.inventory_transactions.create({
        data: {
          variant_id: detail.variant_id,
          change_quantity: detail.quantity,
          reason: 'order_returned', // ✅ Khác với cancelled
          order_id: order.order_id,
        },
      });

      await tx.product_variants.update({
        where: { variant_id: detail.variant_id },
        data: { quantity: { increment: detail.quantity } },
      });
    }

    // 2️⃣ Hoàn voucher
    if (order.voucher_id) {
      await tx.vouchers.update({
        where: { voucher_id: order.voucher_id },
        data: { used_count: { decrement: 1 } },
      });
    }

    // 3️⃣ Hoàn tiền nếu đã thanh toán
    if (order.payment_status === 'paid') {
      await tx.payments.updateMany({
        where: { order_id: order.order_id },
        data: { status: 'refunded' },
      });
    }
  }

  /**
   * Lấy lịch sử thay đổi trạng thái đơn hàng
   */
  async getOrderStatusHistory(orderId: number) {
    // Kiểm tra đơn hàng tồn tại
    const orderExists = await this.prisma.orders.findUnique({
      where: { order_id: orderId },
      select: { order_id: true },
    });

    if (!orderExists) {
      throw new NotFoundException(`Đơn hàng #${orderId} không tồn tại`);
    }

    const history = await this.prisma.order_status_history.findMany({
      where: { order_id: orderId },
      include: {
        users: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      orderId,
      history: history.map((h) => ({
        order_update_id: h.order_update_id,
        status: h.status,
        status_label: this.getStatusLabel(h.status),
        updated_by: h.users
          ? {
              user_id: h.users.user_id,
              username: h.users.username,
              full_name: h.users.full_name,
            }
          : null,
        created_at: this.formatDate(h.created_at),
      })),
    };
  }

  // ============================================
  // DASHBOARD & STATISTICS METHODS
  // ============================================

  /**
   * Dashboard tổng quan
   */
  async getDashboardOverview() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Doanh thu tháng này
    const monthRevenue = await this.getRevenueByMonth(currentMonth, currentYear);

    // Doanh thu năm này
    const yearRevenue = await this.getRevenueByYear(currentYear);

    // Top 5 sản phẩm tháng này
    const topProducts = await this.getTopProducts(5, currentMonth, currentYear);

    // Tổng số đơn hàng
    const totalOrders = await this.prisma.orders.count();

    // Đơn hàng pending
    const pendingOrders = await this.prisma.orders.count({
      where: { order_status: 'pending' },
    });

    return {
      monthRevenue,
      yearRevenue,
      topProducts: topProducts.products,
      totalOrders,
      pendingOrders,
    };
  }

  /**
   * Doanh thu theo tháng cụ thể
   */
  async getRevenueByMonth(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const orders = await this.prisma.orders.findMany({
      where: {
        created_at: {
          gte: startDate,
          lt: endDate,
        },
        order_status: { in: ['completed', 'delivered'] },
      },
      select: {
        total_price: true,
        shipping_fee: true,
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    const totalShipping = orders.reduce((sum, o) => sum + Number(o.shipping_fee || 0), 0);
    const orderCount = orders.length;

    return {
      month,
      year,
      totalRevenue,
      totalShipping,
      orderCount,
      averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
    };
  }

  /**
   * Doanh thu theo năm
   */
  async getRevenueByYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const orders = await this.prisma.orders.findMany({
      where: {
        created_at: {
          gte: startDate,
          lt: endDate,
        },
        order_status: { in: ['completed', 'delivered'] },
      },
      select: {
        total_price: true,
        shipping_fee: true,
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    const totalShipping = orders.reduce((sum, o) => sum + Number(o.shipping_fee || 0), 0);
    const orderCount = orders.length;

    return {
      year,
      totalRevenue,
      totalShipping,
      orderCount,
      averageOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0,
    };
  }

  /**
   * Lấy thống kê doanh thu theo năm (chia theo tháng)
   */
  async getYearlyStatistics(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const orders = await this.prisma.orders.findMany({
      where: {
        created_at: {
          gte: startDate,
          lt: endDate,
        },
        order_status: { in: ['completed', 'delivered'] },
      },
      select: {
        order_id: true,
        total_price: true,
        shipping_fee: true,
        created_at: true,
      },
    });

    // Group by month
    const monthlyMap = new Map<number, { revenue: number; shipping: number; count: number }>();

    for (let m = 1; m <= 12; m++) {
      monthlyMap.set(m, { revenue: 0, shipping: 0, count: 0 });
    }

    orders.forEach((order) => {
      const month = order.created_at.getMonth() + 1;
      const data = monthlyMap.get(month)!;
      data.revenue += Number(order.total_price || 0);
      data.shipping += Number(order.shipping_fee || 0);
      data.count += 1;
    });

    const monthNames = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      monthName: monthNames[month - 1],
      revenue: data.revenue,
      shipping: data.shipping,
      orderCount: data.count,
      averageOrderValue: data.count > 0 ? data.revenue / data.count : 0,
    }));

    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const totalOrders = monthlyData.reduce((sum, m) => sum + m.orderCount, 0);

    return {
      year,
      totalRevenue,
      totalOrders,
      averageMonthlyRevenue: totalRevenue / 12,
      monthlyData,
    };
  }

  /**
   * Lấy top sản phẩm bán chạy
   */
  async getTopProducts(limit: number = 10, month?: number, year?: number) {
    const whereClause: any = {
      orders: {
        order_status: { in: ['completed', 'delivered'] },
      },
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      whereClause.orders.created_at = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      whereClause.orders.created_at = {
        gte: startDate,
        lt: endDate,
      };
    }

    const orderDetails = await this.prisma.order_detail.findMany({
      where: whereClause,
      include: {
        product_variants: {
          include: {
            products: {
              include: {
                brands: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    const productMap = new Map<
      number,
      {
        variant_id: number;
        sku: string;
        product_name: string;
        brand: string;
        category: string;
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
      }
    >();

    orderDetails.forEach((detail) => {
      const variantId = detail.variant_id;
      const existing = productMap.get(variantId);
      const revenue = Number(detail.total_price || 0);
      const quantity = detail.quantity;

      if (existing) {
        existing.totalQuantity += quantity;
        existing.totalRevenue += revenue;
        existing.orderCount += 1;
      } else {
        productMap.set(variantId, {
          variant_id: variantId,
          sku: detail.product_variants?.sku || '',
          product_name: detail.product_variants?.products?.product_name || 'N/A',
          brand: detail.product_variants?.products?.brands?.brand_name || 'N/A',
          category: detail.product_variants?.products?.categories?.category_name || 'N/A',
          totalQuantity: quantity,
          totalRevenue: revenue,
          orderCount: 1,
        });
      }
    });

    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    const products = sorted.map((p, index) => ({
      rank: index + 1,
      ...p,
      averagePrice: p.totalQuantity > 0 ? p.totalRevenue / p.totalQuantity : 0,
    }));

    let period = 'Toàn bộ';
    if (month && year) {
      period = `Tháng ${month}/${year}`;
    } else if (year) {
      period = `Năm ${year}`;
    }

    return { products, period };
  }

  /**
   * Lấy doanh thu theo danh mục
   */
  async getRevenueByCategory(month?: number, year?: number) {
    const whereClause: any = {
      order_status: { in: ['completed', 'delivered'] },
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      whereClause.created_at = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      whereClause.created_at = {
        gte: startDate,
        lt: endDate,
      };
    }

    const orders = await this.prisma.orders.findMany({
      where: whereClause,
      include: {
        order_detail: {
          include: {
            product_variants: {
              include: {
                products: {
                  include: {
                    categories: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<
      number,
      {
        category_id: number;
        category_name: string;
        totalRevenue: number;
        totalQuantity: number;
        orderCount: number;
      }
    >();

    orders.forEach((order) => {
      order.order_detail.forEach((detail) => {
        const category = detail.product_variants?.products?.categories;
        if (!category) return;

        const catId = category.category_id;
        const revenue = Number(detail.total_price || 0);
        const quantity = detail.quantity;

        const existing = categoryMap.get(catId);
        if (existing) {
          existing.totalRevenue += revenue;
          existing.totalQuantity += quantity;
          existing.orderCount += 1;
        } else {
          categoryMap.set(catId, {
            category_id: catId,
            category_name: category.category_name,
            totalRevenue: revenue,
            totalQuantity: quantity,
            orderCount: 1,
          });
        }
      });
    });

    const totalRevenue = Array.from(categoryMap.values()).reduce(
      (sum, c) => sum + c.totalRevenue,
      0,
    );

    const categories = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        percentage: totalRevenue > 0 ? (c.totalRevenue / totalRevenue) * 100 : 0,
        averageOrderValue: c.orderCount > 0 ? c.totalRevenue / c.orderCount : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return { categories, totalRevenue };
  }

  /**
   * Lấy doanh thu theo thương hiệu
   */
  async getRevenueByBrand(month?: number, year?: number) {
    const whereClause: any = {
      order_status: { in: ['completed', 'delivered'] },
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      whereClause.created_at = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      whereClause.created_at = {
        gte: startDate,
        lt: endDate,
      };
    }

    const orders = await this.prisma.orders.findMany({
      where: whereClause,
      include: {
        order_detail: {
          include: {
            product_variants: {
              include: {
                products: {
                  include: {
                    brands: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const brandMap = new Map<
      number,
      {
        brand_id: number;
        brand_name: string;
        totalRevenue: number;
        totalQuantity: number;
        orderCount: number;
      }
    >();

    orders.forEach((order) => {
      order.order_detail.forEach((detail) => {
        const brand = detail.product_variants?.products?.brands;
        if (!brand) return;

        const brandId = brand.brand_id;
        const revenue = Number(detail.total_price || 0);
        const quantity = detail.quantity;

        const existing = brandMap.get(brandId);
        if (existing) {
          existing.totalRevenue += revenue;
          existing.totalQuantity += quantity;
          existing.orderCount += 1;
        } else {
          brandMap.set(brandId, {
            brand_id: brandId,
            brand_name: brand.brand_name,
            totalRevenue: revenue,
            totalQuantity: quantity,
            orderCount: 1,
          });
        }
      });
    });

    const totalRevenue = Array.from(brandMap.values()).reduce((sum, b) => sum + b.totalRevenue, 0);

    const brands = Array.from(brandMap.values())
      .map((b) => ({
        ...b,
        percentage: totalRevenue > 0 ? (b.totalRevenue / totalRevenue) * 100 : 0,
        averageOrderValue: b.orderCount > 0 ? b.totalRevenue / b.orderCount : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return { brands, totalRevenue };
  }

  // -------------------
  // Helpers (transform)
  // -------------------
  private transformOrder(order: orders) {
    return {
      ...order,
      subtotal_price: Number(order.subtotal_price), // ✅ Fix
      discount_price: Number(order.discount_price), // ✅ Fix
      total_price: Number(order.total_price),
      shipping_fee: Number(order.shipping_fee),
      created_at: this.formatDate(order.created_at),
      updated_at: this.formatDate(order.updated_at),
    };
  }

  private transformPayment(payment: payments) {
    return {
      ...payment,
      amount: Number(payment.amount),
      created_at: this.formatDate(payment.created_at),
      updated_at: this.formatDate(payment.updated_at),
    };
  }

  private transformOrderFull(
    o: orders & {
      customers?: customers | null;
      addresses?: addresses | null;
      vouchers?: vouchers | null;
      payments: payments[];
      order_detail: (order_detail & {
        product_variants?: product_variants | null;
      })[];
    },
  ) {
    return {
      ...this.transformOrder(o),
      customers: o.customers ?? null,
      addresses: o.addresses ?? null,
      vouchers: o.vouchers ?? null,
      payments: Array.isArray(o.payments)
        ? o.payments.map((p: payments) => this.transformPayment(p))
        : [],
      order_detail: Array.isArray(o.order_detail)
        ? o.order_detail.map(
            (d: order_detail & { product_variants?: product_variants | null }) => ({
              ...d,
              total_price: Number(d.total_price),
              product_variants: d.product_variants
                ? {
                    ...d.product_variants,
                    base_price: Number(d.product_variants.base_price ?? 0),
                  }
                : null,
            }),
          )
        : [],
    };
  }

  private formatDate(date: Date | string): string {
    return format(new Date(date), 'HH:mm:ss dd/MM/yyyy');
  }

  getTopProductsByDateRange = async (startDate: Date, endDate: Date, limit = 10) => {
    // Dữ liệu tạm lưu theo variant
    const productMap = new Map<
      number,
      {
        variant_id: number;
        sku: string;
        product_name: string;
        brand: string;
        category: string;
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
      }
    >();

    // Lấy dữ liệu chi tiết đơn hàng trong khoảng ngày
    const orderDetails = await this.prisma.order_detail.findMany({
      where: {
        orders: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
          order_status: { not: 'cancelled' },
        },
      },
      include: {
        product_variants: {
          include: {
            products: {
              include: {
                brands: true,
                categories: true,
              },
            },
          },
        },
      },
    });

    for (const detail of orderDetails) {
      const variant = detail.product_variants;
      const product = variant.products;

      if (!variant || !product) continue;

      const brandName = product.brands?.brand_name ?? 'Unknown';
      const categoryName = product.categories?.category_name ?? 'Uncategorized';

      if (!productMap.has(variant.variant_id)) {
        productMap.set(variant.variant_id, {
          variant_id: variant.variant_id,
          sku: variant.sku,
          product_name: product.product_name,
          brand: brandName,
          category: categoryName,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        });
      }

      const item = productMap.get(variant.variant_id)!;
      item.totalQuantity += detail.quantity;
      item.totalRevenue += Number(detail.total_price);
      item.orderCount += 1;
    }

    // Chuyển Map -> mảng và sắp xếp
    const result = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return result;
  };

  /**
   * 2️⃣ Doanh thu theo ngày (vẽ biểu đồ)
   */
  getRevenueByDateRange = async (startDate: Date, endDate: Date) => {
    const orders = await this.prisma.orders.findMany({
      where: {
        created_at: { gte: startDate, lte: endDate },
        order_status: { not: 'cancelled' },
      },
      include: { order_detail: true },
    });

    const dayMap = new Map<string, { revenue: number; shipping: number; count: number }>();

    for (const order of orders) {
      const dayKey = format(order.created_at, 'yyyy-MM-dd');
      if (!dayMap.has(dayKey)) dayMap.set(dayKey, { revenue: 0, shipping: 0, count: 0 });

      const sumDetail = order.order_detail.reduce((acc, d) => acc + Number(d.total_price), 0);
      const dayData = dayMap.get(dayKey)!;

      dayData.revenue += sumDetail;
      dayData.shipping += Number(order.shipping_fee ?? 0);
      dayData.count += 1;
    }

    const dailyData = Array.from(dayMap.entries())
      .map(([dateKey, data]) => ({
        date: format(new Date(dateKey), 'dd/MM/yyyy'),
        dateKey,
        revenue: data.revenue,
        shipping: data.shipping,
        orderCount: data.count,
        averageOrderValue: data.count ? data.revenue / data.count : 0,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    return dailyData;
  };

  /**
   * 3️⃣ Doanh thu theo danh mục sản phẩm
   */
  getRevenueByCategoryDateRange = async (startDate: Date, endDate: Date) => {
    const categoryMap = new Map<
      number,
      {
        category_id: number;
        category_name: string;
        totalRevenue: number;
        totalQuantity: number;
        orderCount: number;
      }
    >();

    const orderDetails = await this.prisma.order_detail.findMany({
      where: {
        orders: {
          created_at: { gte: startDate, lte: endDate },
          order_status: { not: 'cancelled' },
        },
      },
      include: {
        product_variants: {
          include: {
            products: {
              include: { categories: true },
            },
          },
        },
      },
    });

    for (const detail of orderDetails) {
      const category = detail.product_variants?.products?.categories;
      if (!category) continue;

      if (!categoryMap.has(category.category_id)) {
        categoryMap.set(category.category_id, {
          category_id: category.category_id,
          category_name: category.category_name,
          totalRevenue: 0,
          totalQuantity: 0,
          orderCount: 0,
        });
      }

      const item = categoryMap.get(category.category_id)!;
      item.totalRevenue += Number(detail.total_price);
      item.totalQuantity += detail.quantity;
      item.orderCount += 1;
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  };

  /**
   * 4️⃣ Doanh thu theo thương hiệu sản phẩm
   */
  getRevenueByBrandDateRange = async (startDate: Date, endDate: Date) => {
    const brandMap = new Map<
      number,
      {
        brand_id: number;
        brand_name: string;
        totalRevenue: number;
        totalQuantity: number;
        orderCount: number;
      }
    >();

    const orderDetails = await this.prisma.order_detail.findMany({
      where: {
        orders: {
          created_at: { gte: startDate, lte: endDate },
          order_status: { not: 'cancelled' },
        },
      },
      include: {
        product_variants: {
          include: {
            products: {
              include: { brands: true },
            },
          },
        },
      },
    });

    for (const detail of orderDetails) {
      const brand = detail.product_variants?.products?.brands;
      if (!brand) continue;

      if (!brandMap.has(brand.brand_id)) {
        brandMap.set(brand.brand_id, {
          brand_id: brand.brand_id,
          brand_name: brand.brand_name,
          totalRevenue: 0,
          totalQuantity: 0,
          orderCount: 0,
        });
      }

      const item = brandMap.get(brand.brand_id)!;
      item.totalRevenue += Number(detail.total_price);
      item.totalQuantity += detail.quantity;
      item.orderCount += 1;
    }

    return Array.from(brandMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  };
}
