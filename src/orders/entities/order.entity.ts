import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Address } from '../../address/entities/address.entity';
import { Voucher } from './voucher.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('orders', { schema: 'clothing_ecom' })
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Address, (address) => address.orders, { nullable: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  total_price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  shipping_fee: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  payment_status: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  order_status: string; // pending, delivering, delivered, cancelled

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Voucher, (voucher) => voucher.orders, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @OneToMany(() => OrderDetail, (detail) => detail.order)
  details: OrderDetail[];
}
