import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  async sendOtp(to: string, code: string) {
    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Mã xác thực (OTP)</h2>
        <p>Mã của bạn là:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</div>
        <p>Mã có hiệu lực trong ${process.env.OTP_EXPIRES_MIN ?? 5} phút.</p>
      </div>
    `;
    try {
      await this.transporter.sendMail({
        from: `"Shop" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Mã OTP đăng ký',
        html,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // dùng 'err' thay vì 'e' nếu rule no-unused-vars cứng
      throw new InternalServerErrorException('Không gửi được email OTP');
    }
  }
}
