import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  orderRepository: any;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
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
}
