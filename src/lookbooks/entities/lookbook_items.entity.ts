import { Lookbook } from './lookbook.entity';
import { Product } from '../../products/entities/product.entity';

export class LookbookItem {
  itemId: number;
  lookbookId: number;
  productId: number;
  position?: number;
  note?: string;
  lookbook: Lookbook;
  product: Product;
}
