// src/orders/orders.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VnpayService } from '../payment/vnpay.service';
import { format } from 'date-fns';
import { orders, payments, order_detail, product_variants } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpayService: VnpayService,
  ) {}

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

  // Tạo order + detail + ghi tồn kho + tạo payment + gen URL VNPAY
  async createOrder(dto: CreateOrderDto, customerId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1) Tạo order rỗng
      const order = await tx.orders.create({
        data: {
          customer_id: customerId,
          address_id: dto.addressId,
          total_price: 0,
          shipping_fee: 30000,
          order_status: 'pending',
          payment_status: 'pending',
        },
      });

      let total = 0;

      // 2) Duyệt items
      for (const item of dto.items) {
        const variant = await tx.product_variants.findUnique({
          where: { variant_id: item.variantId },
          select: { variant_id: true, quantity: true, base_price: true },
        });
        if (!variant || variant.quantity < item.quantity) {
          throw new BadRequestException(`Not enough stock for variant ${item.variantId}`);
        }

        const unit = variant.base_price?.toNumber() ?? 0;
        const subTotal = unit * item.quantity;
        total += subTotal;

        await tx.order_detail.create({
          data: {
            order_id: order.order_id,
            variant_id: variant.variant_id,
            quantity: item.quantity,
            total_price: subTotal,
            discount_price: 0,
          },
        });

        // xuất kho
        await tx.inventory_transactions.create({
          data: {
            variant_id: variant.variant_id,
            change_quantity: -item.quantity,
            reason: 'customer order',
            order_id: order.order_id,
          },
        });

        // trừ tồn
        await tx.product_variants.update({
          where: { variant_id: variant.variant_id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // 3) Cập nhật tổng tiền
      const updatedOrder = await tx.orders.update({
        where: { order_id: order.order_id },
        data: { total_price: total },
      });

      // 4) Tạo payment
      const txId = 'TX-' + Date.now();
      const payment = await tx.payments.create({
        data: {
          order_id: updatedOrder.order_id,
          method: 'VNPAY_QR',
          status: 'pending',
          transaction_id: txId,
          amount: total,
        },
      });

      // 5) Link thanh toán
      const qrUrl = this.vnpayService.generatePaymentUrl({
        orderId: updatedOrder.order_id,
        amount: total,
        txnRef: txId,
      });

      // 6) Trả về
      return {
        order: this.transformOrder(updatedOrder),
        payment: this.transformPayment(payment),
        qrUrl,
      };
    });
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
      averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
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

  private transformOrderFull(o: any) {
    return {
      ...this.transformOrder(o as orders),
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
              discount_price: Number(d.discount_price ?? 0),
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
}
