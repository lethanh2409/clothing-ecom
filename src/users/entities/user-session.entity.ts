import { User } from './user.entity';

export class UserSession {
  session_id: number;

  user_id: number;

  refresh_token: string;

  ip_address: string;

  user_agent: string;

  expires_at: Date;

  is_active: number;

  created_at: Date;

  updated_at: Date;

  user: User;
}
