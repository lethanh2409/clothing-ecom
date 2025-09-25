import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('variant_assets')
export class VariantAsset {
  @PrimaryGeneratedColumn()
  asset_id: number;

  @Column()
  variant_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // ví dụ: image, video

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @ManyToOne(() => ProductVariant, (variant) => variant.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
