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
            warehouse_id: 1, // đảm bảo tồn tại kho id=1
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
