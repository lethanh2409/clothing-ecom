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
import { Product } from './product.entity';
import { VariantAsset } from './variant-asset.entity';
import { OrderDetail } from 'src/orders/entities/order-detail.entity';
import { LookbookItem } from 'src/lookbooks/entities/lookbook_items.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  variant_id: number;

  @Column()
  product_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  // tinyint -> smallint
  @Column({ type: 'smallint', default: 1 })
  status: number;

  // dùng jsonb cho Postgres
  @Column({ type: 'jsonb', nullable: true })
  attribute: {
    color?: string;
    size?: string;
    origin?: string;
    material?: string;
    fit?: string;
    wash?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => VariantAsset, (asset) => asset.variant)
  assets?: VariantAsset[];

  @OneToMany(() => OrderDetail, (detail) => detail.variant)
  orderDetails: OrderDetail[];

  @OneToMany(() => LookbookItem, (item) => item.variant)
  lookbookItems: LookbookItem[];
}
