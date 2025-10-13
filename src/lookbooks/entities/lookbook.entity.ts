import { LookbookItem } from './lookbook_items.entity';

export class Lookbook {
  lookbook_id: number;

  title: string;

  slug: string;

  description: string;

  image: string;

  created_at: Date;

  updated_at: Date;

  items: LookbookItem[];
}
