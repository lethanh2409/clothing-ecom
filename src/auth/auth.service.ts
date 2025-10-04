// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from 'src/users/entities/user-role.entity';

type JwtPayload = { sub: number; username: string; roles: string[] };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // <- inject
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<User>,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password ?? '');
    if (!isPasswordValid) return null;

    return user;
  }

  async login(body: { username: string; password: string }) {
    const user = await this.usersRepository.findOne({
      where: { username: body.username },
      relations: ['userRoles', 'userRoles.role'], // 👈 bắt buộc
    });

    if (!user) {
      throw new UnauthorizedException('Sai username hoặc password');
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Sai username hoặc password');
    }

    // Lấy danh sách role name trực tiếp
    const roleNames = user.userRoles.map((ur) => ur.role.role_name);

    const payload = { sub: user.user_id, email: user.email, roles: roleNames };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    return { access_token, refresh_token, roles: roleNames };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const roles = user.userRoles.map((ur) => ur.role.role_name);

    const payload: JwtPayload = {
      sub: user.user_id,
      username: user.username,
      roles,
    };

    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { access_token: newAccessToken };
  }
}
