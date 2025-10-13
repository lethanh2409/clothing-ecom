import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

export class Product {
  product_id: number;

  brand_id: number;

  category_id: number;

  lookbook_id: number;

  product_name: string;

  slug: string;

  description: string;

  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

  created_at: Date;

  updated_at: Date;

  brand: Brand;

  category: Category;

  variants: ProductVariant[];
}
