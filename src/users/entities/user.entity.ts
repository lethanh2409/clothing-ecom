import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from './user-role.entity';
import { Customer } from './customer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'boolean', default: 1 })
  status: number;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  refresh_token_exp: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToOne(() => Customer, (customer) => customer.user)
  @Exclude()
  customer: Customer;
  sessions: any;
}
