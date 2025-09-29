import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique, JoinColumn } from 'typeorm';
import { Lookbook } from './lookbook.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('lookbook_items')
@Unique(['lookbook', 'variant'])
export class LookbookItem {
  @PrimaryGeneratedColumn()
  item_id: number;

  @ManyToOne(() => Lookbook, (lookbook) => lookbook.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lookbook_id' })
  lookbook: Lookbook;

  @ManyToOne(() => ProductVariant, (variant) => variant.lookbookItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int', nullable: true })
  position: number;

  @Column({ type: 'text', nullable: true })
  note: string;
}
