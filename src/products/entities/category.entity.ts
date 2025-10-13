import { Product } from './product.entity';

export class Category {
  category_id: number;

  category_name: string;

  status: string;

  slug: string;

  description: string;

  created_at: Date;

  updated_at: Date;

  products: Product[];

  parent: Category;

  children: Category[];
}
