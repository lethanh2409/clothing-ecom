import { Exclude } from 'class-transformer';
import { UserRole } from './user-role.entity';
import { Customer } from './customer.entity';

export class User {
  user_id: number;

  username: string;

  password: string;

  email: string;

  phone: string;

  full_name: string;

  status: number;

  refresh_token: string | null;

  refresh_token_exp: Date | null;

  created_at: Date;

  updated_at: Date;

  userRoles: UserRole[];

  customer: Customer;
  sessions: any;
}
