import { Product } from './product.entity';
import { VariantAsset } from './variant-asset.entity';
import { OrderDetail } from 'src/orders/entities/order-detail.entity';
import { LookbookItem } from 'src/lookbooks/entities/lookbook_items.entity';

export class ProductVariant {
  variant_id: number;

  product_id: number;

  sku: string;

  barcode: string;

  cost_price: number;

  base_price: number;

  quantity: number;

  status: number;

  attribute: {
    color?: string;
    size?: string;
    origin?: string;
    material?: string;
    fit?: string;
    wash?: string;
  };

  created_at: Date;

  updated_at: Date;

  product: Product;

  assets?: VariantAsset[];

  orderDetails: OrderDetail[];

  lookbookItems: LookbookItem[];
}
