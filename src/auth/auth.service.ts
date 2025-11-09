import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path
import { users } from '@prisma/client';
import { ChangePasswordDto } from 'src/users/dtos/change-password.dto';

export interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<users | null> {
    const user = await this.prisma.users.findUnique({
      where: { username },
      include: {
        user_role: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password ?? '');
    if (!isPasswordValid) return null;

    return user;
  }

  async login(body: { username: string; password: string }) {
    const user = await this.prisma.users.findUnique({
      where: { username: body.username },
      include: {
        user_role: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sai username hoặc password');
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Sai username hoặc password');
    }

    const roleNames = user.user_role.map((ur) => ur.roles.role_name);

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
    // Assume usersService.findByRefreshToken is updated to use Prisma
    // For now, implement directly or update usersService accordingly
    const user = await this.prisma.users.findFirst({
      where: { refresh_token: refreshToken },
      include: {
        user_role: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const roles = user.user_role.map((ur) => ur.roles.role_name);

    const payload: JwtPayload = {
      sub: user.user_id,
      username: user.username,
      roles,
    };

    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { access_token: newAccessToken };
  }

  // auth.service.ts
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.old_password, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu cũ không đúng');

    const hashed = await bcrypt.hash(dto.new_password, 10);
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { password: hashed },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }
}
