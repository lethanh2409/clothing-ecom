// src/auth/auth.controller.ts
import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import express from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { access_token, refresh_token } = await this.authService.login(body);

    // 👇 Set refresh token vào cookie HttpOnly
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return { access_token };
  }

  @Post('refresh')
  async refresh(@Req() req: express.Request) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new Error('No refresh token in cookies');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.refreshToken(refreshToken);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: express.Request) {
    return req.user;
  }
}
