import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import express from 'express';
import { JwtUser } from '../types/jwt-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { access_token, refresh_token, roles } = await this.authService.login(body);

    // 👇 Set refresh token vào cookie HttpOnly
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // bật true khi deploy https
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Trả access token về cho FE
    return { access_token, roles };
  }

  @Post('refresh')
  async refresh(@Req() req: express.Request) {
    const refreshToken = (req.cookies?.['refresh_token'] as string) || undefined;
    console.log({ refreshToken });
    if (!refreshToken) {
      throw new Error('No refresh token in cookies');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: express.Request & { user: JwtUser }) {
    return req.user;
  }
}
