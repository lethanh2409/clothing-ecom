import { User } from './user.entity';
import { Address } from '../../address/entities/address.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Cart } from 'src/cart/entities/cart.entity';

export class Customer {
  customer_id: number;

  user_id: number;

  birthday: Date;

  gender: string;

  created_at: Date;

  updated_at: Date;

  user: User;

  addresses: Address[];

  orders: Order[];

  cart: Cart;
}
