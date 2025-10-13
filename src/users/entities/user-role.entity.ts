import { User } from './user.entity';
import { Role } from './role.entity';

export class UserRole {
  user_role_id: number;

  user_id: number;

  role_id: number;

  user: User;

  role: Role;
}
