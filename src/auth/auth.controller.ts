import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  Patch,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import express from 'express';
import { JwtUser } from '../types/jwt-user.type';
import { Public } from 'src/auth/public.decorator';
import { ChangePasswordDto } from 'src/auth/dtos/change-password.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
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

  @Public()
  @Post('refresh')
  async refresh(@Req() req: express.Request) {
    const refreshToken = (req.cookies?.['refresh_token'] as string) || undefined;
    console.log({ refreshToken });
    if (!refreshToken) {
      throw new Error('No refresh token in cookies');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  getProfile(@Req() req: express.Request & { user: JwtUser }) {
    return req.user;
  }

  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    if (dto.new_password !== dto.confirm_new_password) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }
    try {
      const userId = Number(req.user.userId);
      console.log('userId', userId);
      return await this.authService.changePassword(userId, dto);
    } catch (err) {
      // Log lỗi nếu muốn
      console.error(err);
      // Nếu là HttpException thì trả về như bình thường, còn lỗi khác thì map thành BadRequest
      if (err instanceof HttpException) throw err;
      throw new BadRequestException(err.message || 'Lỗi đổi mật khẩu');
    }
  }

  // 🆘 Khi người dùng quên mật khẩu (đã xác minh OTP)
  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() dto: ChangePasswordDto) {
    // ở đây không cần req.user vì user chưa đăng nhập
    if (dto.new_password !== dto.confirm_new_password) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }
    if (!dto.email) {
      throw new BadRequestException('Vui lòng nhập email liên kết với tài khoản!');
    }
    return this.authService.changePassword(null, dto);
  }
}
