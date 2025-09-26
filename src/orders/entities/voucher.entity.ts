// src/orders/entities/voucher.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('vouchers', { schema: 'clothing_ecom' })
export class Voucher {
  @PrimaryGeneratedColumn()
  voucher_id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  discount_type: 'percent' | 'fixed'; // percent hoặc fixed

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  discount_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  min_order_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  max_discount: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  used_count: number;

  @Column({ type: 'int', default: 1 })
  per_customer_limit: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Order, (order) => order.voucher)
  orders: Order[];
}
