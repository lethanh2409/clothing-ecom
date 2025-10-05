import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../users/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity('addresses')
export class Address {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  address_id: number;

  @Column()
  customer_id: number;

  @Column({ length: 100 })
  consignee_name: string;

  @Column({ length: 20 })
  consignee_phone: string;

  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 100, nullable: true })
  ward: string;

  @Column({ length: 150, nullable: true })
  street: string;

  @Column({ length: 50, nullable: true })
  house_num: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Thêm relation ngược lại
  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];
}
