import { Customer } from '../../users/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';

// @Entity('addresses')
export class Address {
  [x: string]: any;
  address_id: number;

  customer_id: number;

  // @Column({ length: 100, default: 'unknonw' })
  consignee_name: string;

  consignee_phone: string;

  province: string;

  district: string;

  ward: string;

  street: string;

  house_num: string;

  is_default: boolean;

  status: boolean;

  created_at: Date;

  updated_at: Date;

  customer: Customer;

  orders: Order[];
}
