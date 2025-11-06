// src/orders/orders.cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersCronService {
  private readonly logger = new Logger(OrdersCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chạy mỗi 30 phút - Tự động huỷ đơn chưa thanh toán quá 24h
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async autoCancelUnpaidOrders() {
    this.logger.log('🔄 Bắt đầu kiểm tra đơn hàng chưa thanh toán...');

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24); // 24 giờ trước

    try {
      const unpaidOrders = await this.prisma.orders.findMany({
        where: {
          order_status: { in: ['pending', 'confirmed'] },
          payment_status: 'pending',
          created_at: {
            lt: yesterday, // Tạo trước 24h
          },
        },
        include: {
          order_detail: {
            include: {
              product_variants: true,
            },
          },
        },
      });

      this.logger.log(`📦 Tìm thấy ${unpaidOrders.length} đơn hàng cần huỷ`);

      for (const order of unpaidOrders) {
        await this.prisma.$transaction(async (tx) => {
          // Hoàn kho
          for (const detail of order.order_detail) {
            await tx.inventory_transactions.create({
              data: {
                variant_id: detail.variant_id,
                change_quantity: detail.quantity,
                reason: 'auto_cancel_unpaid',
                order_id: order.order_id,
              },
            });

            await tx.product_variants.update({
              where: { variant_id: detail.variant_id },
              data: { quantity: { increment: detail.quantity } },
            });
          }

          // Hoàn voucher
          if (order.voucher_id) {
            await tx.vouchers.update({
              where: { voucher_id: order.voucher_id },
              data: { used_count: { decrement: 1 } },
            });
          }

          // Cập nhật trạng thái
          await tx.orders.update({
            where: { order_id: order.order_id },
            data: {
              order_status: 'cancelled',
              note: 'Tự động huỷ do không thanh toán trong 24h',
            },
          });

          // Ghi lịch sử
          await tx.order_status_history.create({
            data: {
              order_id: order.order_id,
              user_id: null, // System
              status: 'cancelled',
            },
          });

          // Audit log
          await tx.audit_logs.create({
            data: {
              user_id: null,
              action: 'AUTO_CANCEL_ORDER',
              entity_type: 'orders',
              entity_id: order.order_id,
              details: {
                reason: 'unpaid_timeout_24h',
                old_status: order.order_status,
              },
            },
          });
        });

        this.logger.log(`✅ Đã huỷ đơn hàng #${order.order_id}`);
      }

      this.logger.log('✅ Hoàn thành kiểm tra đơn hàng');
    } catch (error) {
      this.logger.error('❌ Lỗi khi tự động huỷ đơn:', error);
    }
  }
}
