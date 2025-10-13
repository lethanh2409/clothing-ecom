import { Lookbook } from './lookbook.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

export class LookbookItem {
  item_id: number;

  lookbook: Lookbook;

  variant: ProductVariant;

  position: number;

  note: string;
}
