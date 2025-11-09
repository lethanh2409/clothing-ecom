import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Kiểm tra config trước khi khởi tạo
    if (!host || !user || !pass) {
      this.logger.error('❌ Thiếu cấu hình SMTP trong file .env');
      this.logger.error(`SMTP_HOST: ${host ? '✓' : '✗'}`);
      this.logger.error(`SMTP_USER: ${user ? '✓' : '✗'}`);
      this.logger.error(`SMTP_PASS: ${pass ? '✓' : '✗'}`);
      throw new Error('SMTP configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true cho port 465, false cho các port khác
      auth: { user, pass },
      // Thêm config để debug
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production',
    });

    this.logger.log(`✅ SMTP configured: ${host}:${port} (${user})`);
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const expiresMin = process.env.OTP_EXPIRES_MIN ?? '5';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#333">Mã xác thực (OTP)</h2>
        <p style="color:#666">Mã OTP của bạn là:</p>
        <div style="
          background:#f5f5f5;
          padding:20px;
          border-radius:8px;
          text-align:center;
          margin:20px 0
        ">
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb">
            ${code}
          </div>
        </div>
        <p style="color:#666">Mã có hiệu lực trong <strong>${expiresMin} phút</strong>.</p>
        <p style="color:#999;font-size:12px">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"Shop Thời Trang" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Mã OTP xác thực tài khoản',
        html,
      });

      this.logger.log(`✅ Email OTP sent to ${to} | MessageID: ${info.messageId}`);
    } catch (error) {
      this.logger.error('❌ Failed to send OTP email:', error);

      // Log chi tiết lỗi để debug
      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);

        // Xử lý các loại lỗi phổ biến
        if (error.message.includes('Invalid login')) {
          throw new InternalServerErrorException(
            'Cấu hình email không đúng. Vui lòng kiểm tra SMTP_USER và SMTP_PASS.',
          );
        }
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
          throw new InternalServerErrorException(
            'Không thể kết nối đến server email. Vui lòng kiểm tra SMTP_HOST và SMTP_PORT.',
          );
        }
      }

      throw new InternalServerErrorException(
        'Không thể gửi email OTP. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
      );
    }
  }

  // Thêm method để test connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('❌ SMTP connection failed:', error);
      return false;
    }
  }

  async sendInvoice(
    to: string,
    fullName: string,
    order: any,
    items: Array<{ product_name: string; quantity: number; unit_price: number; subtotal: number }>,
    total: number,
  ) {
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align:right">${item.quantity}</td>
        <td style="text-align:right">${item.unit_price.toLocaleString()}₫</td>
        <td style="text-align:right">${item.subtotal.toLocaleString()}₫</td>
      </tr>
    `,
      )
      .join('');

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2>Hóa đơn đơn hàng #${order.order_id}</h2>
      <p>Khách hàng: ${fullName} (${to})</p>
      <table width="100%" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ccc;text-align:left">Sản phẩm</th>
            <th style="border-bottom:1px solid #ccc;text-align:right">SL</th>
            <th style="border-bottom:1px solid #ccc;text-align:right">Đơn giá</th>
            <th style="border-bottom:1px solid #ccc;text-align:right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <h3>Tổng: ${total.toLocaleString()}₫</h3>
      <p>Cảm ơn bạn đã đặt hàng!</p>
    </div>
  `;

    await this.sendMail(to, `Hóa đơn đơn hàng #${order.order_id}`, html);
  }

  // Ví dụ thêm sendMail method public
  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Shop Thời Trang" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`✅ Email sent to ${to} | MessageID: ${info.messageId}`);
    } catch (err) {
      this.logger.error(`❌ Failed to send email to ${to}`, err);
    }
  }
}
