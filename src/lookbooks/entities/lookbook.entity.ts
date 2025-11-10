import { LookbookItem } from './lookbook_items.entity';
export class Lookbook {
  lookbookId: number;

  title: string;

  slug: string;

  description: string;

  image?: string;

  status: string;

  createdAt: Date;

  updatedAt: Date;

  lookbookItems: LookbookItem[];
}
