// src/inventory/inventory.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InventoryService } from './inventory.service';

@Injectable()
export class InventoryCron {
  private readonly logger = new Logger(InventoryCron.name);

  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Tạo snapshot tồn kho mỗi ngày lúc 01:00 sáng
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailySnapshot() {
    this.logger.log('🔄 Bắt đầu tạo snapshot tồn kho hàng ngày...');

    try {
      const result = await this.inventoryService.createSnapshot();

      this.logger.log(
        `✅ Tạo snapshot thành công: ${result.snapshotCount} variants, Tổng: ${result.totalQuantity} sản phẩm`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Lỗi khi tạo snapshot tồn kho:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Xóa snapshots cũ hơn 90 ngày - chạy mỗi Chủ Nhật lúc 02:00 sáng
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleCleanupSnapshots() {
    this.logger.log('🧹 Bắt đầu dọn dẹp snapshots cũ...');

    try {
      const result = await this.inventoryService.cleanOldSnapshots(90);

      this.logger.log(
        `✅ Dọn dẹp thành công: Đã xóa ${result.deletedCount} snapshots cũ hơn ${result.cutoffDate}`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Lỗi khi dọn dẹp snapshots:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Kiểm tra và cảnh báo tồn kho thấp - chạy mỗi 6 giờ
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleLowStockAlert() {
    this.logger.log('⚠️ Kiểm tra tồn kho thấp...');

    try {
      const lowStock = await this.inventoryService.getLowStockVariants();
      const outOfStock = await this.inventoryService.getOutOfStockVariants();

      if (outOfStock.count > 0) {
        this.logger.warn(`🚨 HẾT HÀNG: ${outOfStock.count} variants hết hàng!`);
        this.logger.warn(`SKUs: ${outOfStock.variants.map((v) => v.sku).join(', ')}`);
        // TODO: Gửi email/notification cho admin
      }

      if (lowStock.length > 0) {
        this.logger.warn(`⚠️ TỒN KHO THẤP: ${lowStock.length} variants có tồn kho < 10`);
        // TODO: Gửi email/notification cho admin
      }

      if (outOfStock.count === 0 && lowStock.length === 0) {
        this.logger.log('✅ Tồn kho ổn định');
      }
    } catch (error) {
      this.logger.error(
        '❌ Lỗi khi kiểm tra tồn kho:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
