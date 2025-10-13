import { Order } from './order.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

export class OrderDetail {
  order_detail_id: number;

  order: Order;

  variant: ProductVariant;

  quantity: number;

  total_price: number;

  discount_price: number;
}
