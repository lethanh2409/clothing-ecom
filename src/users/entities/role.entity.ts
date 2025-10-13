import { UserRole } from './user-role.entity';

export class Role {
  role_id: number;

  role_name: string; // e.g. 'CUSTOMER', 'ADMIN';

  description: string;

  status: number;

  userRoles: UserRole[];
}
