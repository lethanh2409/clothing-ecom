import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  category_name: string;

  @Column({ nullable: true })
  parent_id: number;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
