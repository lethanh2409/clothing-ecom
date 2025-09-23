import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('User không tồn tại');
    console.log(user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai mật khẩu');

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.user_id, username: user.username };

    // access token ngắn hạn
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    // refresh token dài hạn
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // Lưu refresh token + hạn vào DB
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.usersService.updateRefreshToken(user.user_id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // So sánh refresh token
    const isMatch = refreshToken === user.refresh_token;
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token không đúng');
    }

    const payload = { sub: user.user_id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    };
  }
}
