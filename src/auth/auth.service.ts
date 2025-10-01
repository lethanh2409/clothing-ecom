// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

type JwtPayload = { sub: number; username: string; roles: string[] };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // <- inject
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async login(user: { username: string; password: string }) {
    const validUser = await this.validateUser(user.username, user.password);
    if (!validUser) {
      throw new UnauthorizedException('Đăng nhập không thành công');
    }

    const roles = validUser.userRoles.map((ur) => ur.role.role_name);

    const payload: JwtPayload = {
      sub: validUser.user_id,
      username: validUser.username,
      roles,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.usersService.updateRefreshToken(validUser.user_id, refresh_token);

    return { access_token, refresh_token };
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
