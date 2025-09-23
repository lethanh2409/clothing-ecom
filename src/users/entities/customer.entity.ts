import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToOne(() => User, (user) => user.customer)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
