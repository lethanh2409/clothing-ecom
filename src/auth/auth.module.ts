import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { OtpService } from './otp/otp.service';
import { OtpController } from './otp/otp.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-super-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, OtpService],
  controllers: [AuthController, OtpController],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
