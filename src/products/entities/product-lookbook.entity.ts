import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Product } from './product.entity';
import { Lookbook } from './lookbook.entity';

@Entity('product_lookbook')
export class ProductLookbook {
  @PrimaryGeneratedColumn()
  prd_lb_id: number;

  @Column()
  product_id: number;

  @Column()
  lookbook_id: number;

  @ManyToOne(() => Product, (product) => product.productLookbooks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Lookbook, (lookbook) => lookbook.productLookbooks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lookbook_id' })
  lookbook: Lookbook;
}
