import { Customer } from '../../users/entities/customer.entity';
import { Address } from '../../address/entities/address.entity';
import { Voucher } from './voucher.entity';
import { OrderDetail } from './order-detail.entity';

export class Order {
  order_id: number;

  customer: Customer;

  address: Address;

  total_price: number;

  shipping_fee: number;

  note: string;

  payment_status: string;

  order_status: string; // pending, delivering, delivered, cancelled

  created_at: Date;

  updated_at: Date;

  voucher: Voucher;

  details: OrderDetail[];
}
