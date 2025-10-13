import { Customer } from '../../users/entities/customer.entity';
import { CartDetail } from './cart-detail.entity';

export class Cart {
  cart_id: number;

  customer: Customer;

  session_id: string | null;

  total_price: number;

  details!: CartDetail[]; // dùng "!" để khẳng định sẽ có, không báo possibly null

  created_at: Date;

  updated_at: Date;
}
