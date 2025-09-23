import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductLookbook } from './product-lookbook.entity';

@Entity('lookbooks')
export class Lookbook {
  @PrimaryGeneratedColumn()
  lookbook_id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 200, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProductLookbook, (pl) => pl.lookbook)
  productLookbooks: ProductLookbook[];
}
