import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductLookbook } from './product-lookbook.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column()
  brand_id: number;

  @Column()
  category_id: number;

  @Column({ nullable: true })
  lookbook_id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  product_name: string;

  @Column({ type: 'varchar', length: 250, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // product.entity.ts
  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductLookbook, (productLookbook) => productLookbook.product)
  productLookbooks: ProductLookbook[];
}
