// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

type JwtPayload = { sub: number; username: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // <- inject
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('User không tồn tại');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai mật khẩu');
    return user;
  }

  async login(user: { username: string; password: string }) {
    const validUser = await this.validateUser(user.username, user.password);
    if (!validUser) {
      throw new UnauthorizedException('Đăng nhập không thành công');
    }

    const payload: JwtPayload = { sub: validUser.user_id, username: validUser.username };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 👉 Lưu raw refresh token
    await this.usersService.updateRefreshToken(validUser.user_id, refresh_token);

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign(
      { sub: user.user_id, username: user.username },
      { expiresIn: '15m' },
    );

    return { access_token: newAccessToken };
  }
}
