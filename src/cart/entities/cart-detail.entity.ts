import { Cart } from './cart.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

export class CartDetail {
  cart_detail_id: number;

  cart: Cart;

  variant: ProductVariant;

  sub_price: number;

  quantity: number;
}
