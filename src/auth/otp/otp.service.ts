import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// ----- cấu hình -----
const EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MIN ?? 5);
const RESEND_COOLDOWN = Number(process.env.OTP_RESEND_COOLDOWN_SEC ?? 60);
const MAX_SEND_PER_HOUR = Number(process.env.OTP_MAX_SEND_PER_HOUR ?? 5);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

// 👉 nới lỏng để controller/DTO có thể truyền string
type OtpPurpose = string;

interface OtpJwtPayload {
  email: string;
  purpose: OtpPurpose;
  ok: true;
  iat?: number;
  exp?: number;
}

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private signOtpToken(email: string, purpose: OtpPurpose): string {
    const secret = process.env.OTP_JWT_SECRET || 'otp_secret';
    const ttl = process.env.OTP_JWT_TTL || '10m';
    const payload: OtpJwtPayload = { email, purpose, ok: true };
    return jwt.sign(payload, secret, { expiresIn: ttl });
  }

  verifyOtpToken(token: string, purpose: OtpPurpose): { email: string } {
    const secret = process.env.OTP_JWT_SECRET || 'otp_secret';
    try {
      const payload = jwt.verify(token, secret) as unknown as OtpJwtPayload;
      if (!payload?.ok || payload.purpose !== purpose) {
        throw new UnauthorizedException('OTP token không đúng mục đích');
      }
      return { email: payload.email };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      throw new UnauthorizedException('OTP token không hợp lệ/đã hết hạn');
    }
  }

  async send(email: string, purpose: OtpPurpose = 'register'): Promise<void> {
    const now = new Date();

    // để TS tự suy luận kiểu: (email_otps | null)
    const exists = await this.prisma.email_otps.findFirst({
      where: { email, purpose },
    });

    if (exists) {
      const diffSec = (now.getTime() - exists.updated_at.getTime()) / 1000;
      if (diffSec < RESEND_COOLDOWN) {
        const waitSec = Math.ceil(RESEND_COOLDOWN - diffSec);
        throw new HttpException(`Vui lòng thử lại sau ${waitSec}s`, HttpStatus.TOO_MANY_REQUESTS);
      }
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const sentCount = exists.created_at < oneHourAgo ? 0 : exists.sent_count;
      if (sentCount >= MAX_SEND_PER_HOUR) {
        throw new HttpException(
          'Bạn đã gửi quá số lần trong 1 giờ, vui lòng thử lại sau',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const code = this.generateCode();
    const hash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(now.getTime() + EXPIRES_MIN * 60 * 1000);

    if (exists) {
      await this.prisma.email_otps.update({
        where: { id: exists.id },
        data: {
          code_hash: hash,
          expires_at: expiresAt,
          consumed_at: null,
          attempts: 0,
          sent_count: exists.sent_count + 1,
        },
      });
    } else {
      await this.prisma.email_otps.create({
        data: {
          email,
          purpose,
          code_hash: hash,
          expires_at: expiresAt,
          attempts: 0,
          sent_count: 1,
        },
      });
    }

    await this.mail.sendOtp(email, code);
  }

  async verify(email: string, code: string, purpose: OtpPurpose): Promise<{ otp_token: string }> {
    const rec = await this.prisma.email_otps.findFirst({ where: { email, purpose } });
    if (!rec) throw new NotFoundException('OTP không tồn tại. Vui lòng gửi lại.');
    if (rec.consumed_at) throw new BadRequestException('OTP đã được sử dụng');
    if (rec.expires_at < new Date()) throw new BadRequestException('OTP đã hết hạn');
    if (rec.attempts >= MAX_ATTEMPTS) {
      throw new HttpException('Bạn đã nhập sai quá số lần cho phép', HttpStatus.TOO_MANY_REQUESTS);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const ok = await bcrypt.compare(code, rec.code_hash);
    if (!ok) {
      await this.prisma.email_otps.update({
        where: { id: rec.id },
        data: { attempts: rec.attempts + 1 },
      });
      throw new BadRequestException('Mã OTP không đúng');
    }

    await this.prisma.email_otps.update({
      where: { id: rec.id },
      data: { consumed_at: new Date() },
    });

    const otp_token = this.signOtpToken(email, purpose);
    return { otp_token };
  }
}
