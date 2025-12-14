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
    console.log('📧 Sending OTP to:', email);
    const now = new Date();

    // ✅ 1. Kiểm tra tồn tại trong bảng users trước khi gửi OTP
    const user = await this.prisma.users.findUnique({ where: { email } });
    console.log('📧 Check user existence:', user ? 'found' : 'not found');
    if (purpose === 'register' && user) {
      throw new BadRequestException('Email này đã được sử dụng để đăng ký');
    }

    if (purpose === 'reset' && !user) {
      throw new NotFoundException('Email này chưa được đăng ký trong hệ thống');
    }

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
        where: { otp_id: exists.otp_id },
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
    console.log('📧 Sending OTP to:', code);
    await this.mail.sendOtp(email, code);
  }

  async verify(
    email: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<{ success: boolean; message: string }> {
    const otp = await this.prisma.email_otps.findFirst({ where: { email, purpose } });
    if (!otp) throw new NotFoundException('OTP không tồn tại hoặc chưa được gửi');

    // Kiểm tra trạng thái
    if (otp.consumed_at) throw new BadRequestException('OTP đã được sử dụng');
    if (otp.expires_at < new Date()) throw new BadRequestException('OTP đã hết hạn');
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new HttpException('Bạn đã nhập sai quá số lần cho phép', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Kiểm tra mã OTP
    const isValid = await bcrypt.compare(code, otp.code_hash);
    if (!isValid) {
      await this.prisma.email_otps.update({
        where: { otp_id: otp.otp_id },
        data: { attempts: otp.attempts + 1 },
      });
      throw new BadRequestException('Mã OTP không chính xác');
    }

    // Nếu hợp lệ → đánh dấu đã sử dụng
    await this.prisma.email_otps.update({
      where: { otp_id: otp.otp_id },
      data: { consumed_at: new Date() },
    });

    return { success: true, message: 'Xác minh OTP thành công' };
  }
}
