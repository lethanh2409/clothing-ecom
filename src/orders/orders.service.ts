import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VnpayService } from '../payment/vnpay.service';
import { format } from 'date-fns';
import { orders, payments } from '@prisma/client';

@Injectable()
export class OrdersService {
  orderRepository: any;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly prisma: PrismaService,
    private readonly vnpayService: VnpayService,
  ) {}

  async findAll() {
    return this.orderRepo.find({
      relations: ['customer', 'details', 'details.variant'],
    });
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { order_id: orderId },
      relations: [
        'customer',
        'address',
        'voucher',
        'details',
        'details.variant',
        'details.variant.assets', // ✅ Thêm dòng này
        'details.variant.product',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { customer: { user_id: userId } },
      relations: [
        'customer',
        'address',
        'voucher',
        'details',
        'details.variant',
        'details.variant.assets', // ✅ Thêm dòng này
        'details.variant.product',
      ],
      order: { created_at: 'DESC' },
    });
  }


  async createOrder(dto: CreateOrderDto, customerId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Tạo order (ban đầu total_price = 0)
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

      // 2. Duyệt qua item
      for (const item of dto.items) {
        const variant = await tx.product_variants.findUnique({
          where: { variant_id: item.variantId },
        });

        if (!variant || variant.quantity < item.quantity) {
          throw new BadRequestException(`Not enough stock for variant ${item.variantId}`);
        }

        const subTotal = Number(variant.base_price) * item.quantity;
        total += subTotal;

        // 2.1 Lưu order detail
        await tx.order_detail.create({
          data: {
            order_id: order.order_id,
            variant_id: variant.variant_id,
            quantity: item.quantity,
            total_price: subTotal,
            discount_price: 0,
          },
        });

        // 2.2 Ghi inventory transaction
        await tx.inventory_transactions.create({
          data: {
            variant_id: variant.variant_id,
            change_quantity: -item.quantity,
            reason: 'customer order',
            order_id: order.order_id,
          },
        });

        // 2.3 Trừ tồn kho
        await tx.product_variants.update({
          where: { variant_id: variant.variant_id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // 3. Update tổng tiền order
      const updatedOrder = await tx.orders.update({
        where: { order_id: order.order_id },
        data: { total_price: total },
      });

      // 4. Tạo payment record
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

      // 5. Sinh link QR VNPAY
      const qrUrl = this.vnpayService.generatePaymentUrl({
        orderId: updatedOrder.order_id,
        amount: total,
        txnRef: txId,
      });

      // 6. Trả về dữ liệu đã transform
      return {
        order: this.transformOrder(updatedOrder),
        payment: this.transformPayment(payment),
        qrUrl,
      };
    });
  }

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

  private formatDate(date: Date | string): string {
    return format(new Date(date), 'HH:mm:ss dd/MM/yyyy'); // 24h format
  }
}
