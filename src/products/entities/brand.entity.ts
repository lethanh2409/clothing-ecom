import { Product } from './product.entity';

export class Brand {
  brand_id: number;

  brand_name: string;

  status: string;

  slug: string;

  description: string;

  logo_url: string;

  created_at: Date;

  updated_at: Date;

  products: Product[];
}
