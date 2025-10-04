import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/binary';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);

  private tmnCode = (process.env.VNPAY_TMN_CODE || '').trim();
  private secretKey = (process.env.VNPAY_HASH_SECRET || '').trim(); // ⚠️ dùng đúng biến .env bạn đã khai báo
  private vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3618/payment/return';

  constructor(private prisma: PrismaService) {}

  // encode đúng yêu cầu VNPAY: encodeURIComponent + thay %20 thành +
  private encodeVal(v: string) {
    return encodeURIComponent(v).replace(/%20/g, '+');
  }

  private sortAndEncode(params: Record<string, any>) {
    const keys = Object.keys(params).filter(
      (k) => params[k] !== undefined && params[k] !== null && params[k] !== '',
    );
    keys.sort(); // alphabet tăng dần

    const out: Record<string, string> = {};
    for (const k of keys) out[k] = this.encodeVal(String(params[k]));
    return out;
  }

  generatePaymentUrl(payload: { orderId: number; amount: number; txnRef: string }) {
    const d = new Date();
    const createDate =
      d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0');

    // tham số thô
    const raw: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: Math.round(payload.amount * 100), // luôn là integer
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${payload.orderId}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.returnUrl,
      vnp_TxnRef: payload.txnRef,
    };

    // 1) sort + encode value
    const sortedEncoded = this.sortAndEncode(raw);

    // 2) signData CHÍNH LÀ querystring của bản đã encode (không có '?')
    const signData = qs.stringify(sortedEncoded, { encode: false });

    // 3) ký HMAC-SHA512
    const signed = crypto
      .createHmac('sha512', this.secretKey)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    // ⬇️ log debug để so sánh khi cần
    this.logger.debug(`VNPAY signData = ${signData}`);
    this.logger.debug(`VNPAY signed   = ${signed}`);

    // 4) url cuối
    return `${this.vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
  }

  private buildSignData(params: Record<string, any>) {
    const sorted: Record<string, string> = {};
    Object.keys(params)
      .sort()
      .forEach((k) => {
        sorted[k] = this.encodeVal(String(params[k]));
      });
    return qs.stringify(sorted, { encode: false });
  }

  async verifyAndProcessReturn(query: Record<string, any>) {
    // 1) Verify chữ ký
    const vnpSecureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const signData = this.buildSignData(query);
    const signed = crypto
      .createHmac('sha512', this.secretKey)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    if (signed !== vnpSecureHash) {
      throw new BadRequestException('Sai chữ ký – dữ liệu không hợp lệ!');
    }

    // 2) Lấy txnRef an toàn
    const txnRef = String(query['vnp_TxnRef'] || '').trim();
    if (!txnRef) {
      throw new BadRequestException('Thiếu vnp_TxnRef');
    }

    // 3) Lấy trạng thái từ VNPAY
    const rspCode = String(query['vnp_ResponseCode'] || '');
    const transStatus = String(query['vnp_TransactionStatus'] || '');

    // 4) Tìm payment theo txnRef (transaction_id)
    const payment = await this.prisma.payments.findFirst({
      where: { transaction_id: txnRef },
      select: { payment_id: true, order_id: true, status: true },
    });
    if (!payment) {
      throw new NotFoundException(`Không tìm thấy payment với txnRef=${txnRef}`);
    }

    // 5) Cập nhật theo kết quả
    if (rspCode === '00' && transStatus === '00') {
      await this.prisma.$transaction(async (tx) => {
        await tx.payments.update({
          where: { payment_id: payment.payment_id },
          data: { status: 'success', raw_response: query },
        });
        await tx.orders.update({
          where: { order_id: payment.order_id },
          data: { payment_status: 'paid', order_status: 'completed' },
        });
      });

      return {
        message: 'Thanh toán thành công',
        orderId: payment.order_id,
        txnRef,
      };
    } else {
      await this.prisma.payments.update({
        where: { payment_id: payment.payment_id },
        data: { status: 'failed', raw_response: query },
      });

      return {
        message: 'Thanh toán thất bại',
        orderId: payment.order_id,
        txnRef,
        rspCode,
        transStatus,
      };
    }
  }

  async retryPayment(orderId: number) {
    // 1. Lấy đơn hàng
    const order = await this.prisma.orders.findUnique({
      where: { order_id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.order_status !== 'pending' || order.payment_status !== 'pending') {
      throw new BadRequestException('Đơn hàng này không thể thanh toán lại');
    }

    // 2. Tạo payment mới
    const txnRef = 'TX-' + Date.now();
    const payment = await this.prisma.payments.create({
      data: {
        order_id: order.order_id,
        method: 'VNPAY_QR',
        status: 'pending',
        transaction_id: txnRef,
        amount: order.total_price,
      },
    });

    // 3. Generate lại URL VNPAY
    const qrUrl = this.generatePaymentUrl({
      orderId: order.order_id,
      amount: (order.total_price as Decimal).toNumber(),
      txnRef,
    });

    return { order, payment, qrUrl };
  }

  //   private transformPayment(payment: any) {
  //   return {
  //     ...payment,
  //     amount: Number(payment.amount),
  //     created_at: this.formatDate(payment.created_at),
  //     updated_at: this.formatDate(payment.updated_at),
  //   };
  // }
}
