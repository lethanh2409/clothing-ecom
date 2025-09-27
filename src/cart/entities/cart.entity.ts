// src/cart/entities/cart.entity.ts
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
import { CartDetail } from './cart-detail.entity';

@Entity('cart', { schema: 'clothing_ecom' })
export class Cart {
  @PrimaryGeneratedColumn()
  cart_id: number;

  @ManyToOne(() => Customer, (customer) => customer.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'varchar', nullable: true })
  session_id: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_price: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => CartDetail, (detail) => detail.cart, { cascade: true })
  details!: CartDetail[]; // dùng "!" để khẳng định sẽ có, không báo possibly null

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
