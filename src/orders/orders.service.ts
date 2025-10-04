import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VnpayService } from '../payment/vnpay.service';

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
      where: { customer: { user_id: userId } }, // dựa trên quan hệ ManyToOne
      relations: [
        'customer',
        'address',
        'voucher',
        'details',
        'details.variant',
        'details.variant.product',
      ],
      order: { created_at: 'DESC' }, // sắp xếp mới nhất trước
    });
  }

  async createOrder(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Tạo order
      const order = await tx.orders.create({
        data: {
          customer_id: dto.customerId,
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
          throw new BadRequestException(`Not enough stock for ${item.variantId}`);
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
            discount_price: 0, // 👈 fix lỗi
          },
        });

        // 2.2 Ghi inventory
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
      await tx.orders.update({
        where: { order_id: order.order_id },
        data: { total_price: total },
      });

      // 4. Tạo payment record
      const txId = 'TX-' + Date.now();
      const payment = await tx.payments.create({
        data: {
          order_id: order.order_id,
          method: 'VNPAY_QR',
          status: 'pending',
          transaction_id: txId,
          amount: total,
        },
      });

      // 5. Sinh link QR VNPAY
      const qrUrl = this.vnpayService.generatePaymentUrl({
        orderId: order.order_id,
        amount: total,
        txnRef: txId,
      });

      return { order, payment, qrUrl };
    });
  }
}
