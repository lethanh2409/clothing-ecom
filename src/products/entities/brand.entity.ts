import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  brand_id: number;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  brand_name: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active', // active | inactive | deleted
  })
  status: string;

  @Column({ type: 'varchar', length: 200, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  logo_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
