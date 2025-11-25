// src/inventory/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format } from 'date-fns';
import {
  InventorySnapshotDto,
  CreateSnapshotResponseDto,
  CleanSnapshotsResponseDto,
  InventoryAtDateDto,
  MonthlyInventoryDto,
  BulkInventoryAtDateDto,
  ChangeReportDto,
  VariantTransactionsDto,
  OutOfStockVariantsDto,
  AdjustStockResponseDto,
  BulkStockAdjustDto,
  BulkStockAdjustResponseDto,
  VariantChangeItem,
} from './dtos/inventory-snapshot.dto';
import { BulkUpdateThresholdDto, UpdateThresholdDto } from './dtos/update-threshold.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // SNAPSHOT MANAGEMENT
  // ============================================

  /**
   * Tạo snapshot tồn kho cho ngày cụ thể
   */
  async createSnapshot(date?: Date): Promise<CreateSnapshotResponseDto> {
    const snapshotDate = date || new Date();
    snapshotDate.setHours(0, 0, 0, 0);

    const variants = await this.prisma.product_variants.findMany({
      select: { variant_id: true, quantity: true },
    });

    if (variants.length === 0) {
      return {
        date: format(snapshotDate, 'yyyy-MM-dd'),
        snapshotCount: 0,
        totalQuantity: 0,
      };
    }

    // Use $transaction with callback function
    const snapshots = await this.prisma.$transaction(
      async (tx) => {
        const results: InventorySnapshotDto[] = [];
        for (const v of variants) {
          const snapshot = await tx.inventory_snapshots.upsert({
            where: {
              variant_id_snapshot_date: {
                variant_id: v.variant_id,
                snapshot_date: snapshotDate,
              },
            },
            create: {
              variant_id: v.variant_id,
              quantity: v.quantity,
              snapshot_date: snapshotDate,
            },
            update: {
              quantity: v.quantity,
            },
          });
          results.push(snapshot as InventorySnapshotDto);
        }
        return results;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    return {
      date: format(snapshotDate, 'yyyy-MM-dd'),
      snapshotCount: snapshots.length,
      totalQuantity: snapshots.reduce((sum, s) => sum + s.quantity, 0),
    };
  }

  /**
   * Xóa snapshots cũ (giữ lại N ngày gần nhất)
   */
  async cleanOldSnapshots(keepDays = 90): Promise<CleanSnapshotsResponseDto> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    cutoffDate.setHours(0, 0, 0, 0);

    const deleted = await this.prisma.inventory_snapshots.deleteMany({
      where: {
        snapshot_date: {
          lt: cutoffDate,
        },
      },
    });

    return {
      deletedCount: deleted.count,
      cutoffDate: format(cutoffDate, 'yyyy-MM-dd'),
    };
  }

  // ============================================
  // HISTORICAL QUERIES
  // ============================================

  /**
   * Lấy tồn kho của 1 variant tại thời điểm cụ thể
   */
  async getInventoryAtDate(variantId: number, date: string | Date): Promise<InventoryAtDateDto> {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    targetDate.setHours(0, 0, 0, 0);

    // Tìm snapshot
    const snapshot = await this.prisma.inventory_snapshots.findUnique({
      where: {
        variant_id_snapshot_date: {
          variant_id: variantId,
          snapshot_date: targetDate,
        },
      },
      include: {
        product_variants: {
          include: {
            products: true,
          },
        },
      },
    });

    if (snapshot) {
      return {
        variant_id: variantId,
        sku: snapshot.product_variants?.sku || undefined,
        product_name: snapshot.product_variants?.products?.product_name || undefined,
        date: format(targetDate, 'yyyy-MM-dd'),
        quantity: snapshot.quantity,
        source: 'snapshot',
      };
    }

    // Nếu không có snapshot, tính từ transactions
    return this.calculateInventoryAtDate(variantId, targetDate);
  }

  /**
   * Tính tồn kho từ transactions (khi không có snapshot)
   */
  private async calculateInventoryAtDate(
    variantId: number,
    targetDate: Date,
  ): Promise<InventoryAtDateDto> {
    const variant = await this.prisma.product_variants.findUnique({
      where: { variant_id: variantId },
      select: {
        variant_id: true,
        sku: true,
        quantity: true,
        products: {
          select: { product_name: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }

    // Lấy tất cả transactions sau ngày đó
    const transactionsAfter = await this.prisma.inventory_transactions.findMany({
      where: {
        variant_id: variantId,
        created_at: { gt: targetDate },
      },
      select: { change_quantity: true },
    });

    // Tính ngược lại: current_quantity - sum(changes_after_date)
    const totalChange = transactionsAfter.reduce((sum, t) => sum + t.change_quantity, 0);
    const quantityAtDate = variant.quantity - totalChange;

    return {
      variant_id: variantId,
      sku: variant.sku || undefined,
      product_name: variant.products?.product_name || undefined,
      date: format(targetDate, 'yyyy-MM-dd'),
      quantity: quantityAtDate,
      source: 'calculated',
    };
  }

  /**
   * Lấy lịch sử tồn kho theo tháng
   */
  async getMonthlyInventory(
    variantId: number,
    month: number,
    year: number,
  ): Promise<MonthlyInventoryDto> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const snapshots = await this.prisma.inventory_snapshots.findMany({
      where: {
        variant_id: variantId,
        snapshot_date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { snapshot_date: 'asc' },
    });

    const variant = await this.prisma.product_variants.findUnique({
      where: { variant_id: variantId },
      select: {
        sku: true,
        products: {
          select: { product_name: true },
        },
      },
    });

    return {
      variant_id: variantId,
      sku: variant?.sku || undefined,
      product_name: variant?.products?.product_name || undefined,
      month,
      year,
      data: snapshots.map((snapshot: { snapshot_date: Date; quantity: number }) => ({
        date: format(snapshot.snapshot_date, 'yyyy-MM-dd'),
        quantity: snapshot.quantity,
      })),
    };
  }

  /**
   * Lấy tồn kho của nhiều variants tại 1 thời điểm
   */
  async getBulkInventoryAtDate(
    variantIds: number[],
    date: string | Date,
  ): Promise<BulkInventoryAtDateDto[]> {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    targetDate.setHours(0, 0, 0, 0);

    const snapshots = await this.prisma.inventory_snapshots.findMany({
      where: {
        variant_id: { in: variantIds },
        snapshot_date: targetDate,
      },
      include: {
        product_variants: {
          include: {
            products: true,
          },
        },
      },
    });

    const results: BulkInventoryAtDateDto[] = snapshots.map((s) => ({
      variant_id: s.variant_id,
      sku: s.product_variants?.sku || undefined,
      product_name: s.product_variants?.products?.product_name || undefined,
      date: format(new Date(targetDate), 'yyyy-MM-dd'),
      quantity: s.quantity,
    }));

    return results;
  }

  // ============================================
  // TRANSACTION REPORTS
  // ============================================

  /**
   * Báo cáo biến động tồn kho theo khoảng thời gian
   */
  async getChangeReport(startDate: Date, endDate: Date): Promise<ChangeReportDto> {
    const transactions = await this.prisma.inventory_transactions.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product_variants: {
          include: {
            products: true,
          },
        },
        orders: {
          select: {
            order_id: true,
            order_status: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const variantMap = new Map<number, VariantChangeItem>();

    transactions.forEach((t) => {
      const variantId = t.variant_id;
      if (!variantMap.has(variantId)) {
        variantMap.set(variantId, {
          variant_id: variantId,
          sku: t.product_variants?.sku || '',
          product_name: t.product_variants?.products?.product_name || 'N/A',
          total_in: 0,
          total_out: 0,
          net_change: 0,
          transaction_count: 0,
        });
      }

      const item = variantMap.get(variantId)!;
      const change = t.change_quantity;

      if (change > 0) {
        item.total_in += change;
      } else {
        item.total_out += Math.abs(change);
      }

      item.net_change += change;
      item.transaction_count += 1;
    });

    return {
      period: {
        from: format(startDate, 'yyyy-MM-dd'),
        to: format(endDate, 'yyyy-MM-dd'),
      },
      summary: {
        totalTransactions: transactions.length,
        variantsAffected: variantMap.size,
      },
      variants: Array.from(variantMap.values()).sort(
        (a, b) => Math.abs(b.net_change) - Math.abs(a.net_change),
      ),
    };
  }

  /**
   * Lấy chi tiết transactions của 1 variant
   */
  async getVariantTransactions(
    variantId: number,
    startDate?: Date,
    endDate?: Date,
    limit = 100,
  ): Promise<VariantTransactionsDto> {
    const whereClause: {
      variant_id: number;
      created_at?: { gte?: Date; lte?: Date };
    } = { variant_id: variantId };

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at.gte = startDate;
      if (endDate) whereClause.created_at.lte = endDate;
    }

    const transactions = await this.prisma.inventory_transactions.findMany({
      where: whereClause,
      include: {
        orders: {
          select: {
            order_id: true,
            order_status: true,
            customers: {
              select: {
                users: {
                  select: { full_name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    const variant = await this.prisma.product_variants.findUnique({
      where: { variant_id: variantId },
      select: {
        sku: true,
        quantity: true,
        products: {
          select: { product_name: true },
        },
      },
    });

    return {
      variant: {
        variant_id: variantId,
        sku: variant?.sku || undefined,
        product_name: variant?.products?.product_name || undefined,
        current_quantity: variant?.quantity || undefined,
      },
      transactions: transactions.map((t) => ({
        inventory_id: t.inventory_id,
        change_quantity: t.change_quantity,
        reason: t.reason,
        order_id: t.order_id,
        order_status: t.orders?.order_status || undefined,
        customer_name: t.orders?.customers?.users?.full_name || undefined,
        created_at: format(t.created_at, 'HH:mm:ss dd/MM/yyyy'),
      })),
    };
  }

  /**
   * Lấy variants hết hàng
   */
  async getOutOfStockVariants(): Promise<OutOfStockVariantsDto> {
    const variants = await this.prisma.product_variants.findMany({
      where: {
        quantity: 0,
        status: true,
      },
      include: {
        products: {
          include: {
            brands: true,
          },
        },
      },
    });

    return {
      count: variants.length,
      variants: variants.map((v) => ({
        variant_id: v.variant_id,
        sku: v.sku,
        product_name: v.products?.product_name || undefined,
        brand: v.products?.brands?.brand_name || undefined,
      })),
    };
  }

  // ============================================
  // STOCK ADJUSTMENT
  // ============================================

  /**
   * Điều chỉnh tồn kho (nhập/xuất thủ công)
   */
  async adjustStock(
    variantId: number,
    changeQuantity: number,
    reason: string,
  ): Promise<AdjustStockResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.product_variants.findUnique({
        where: { variant_id: variantId },
        select: { variant_id: true, quantity: true, sku: true },
      });

      if (!variant) {
        throw new NotFoundException(`Variant ${variantId} not found`);
      }

      const newQuantity = variant.quantity + changeQuantity;

      if (newQuantity < 0) {
        throw new Error(`Cannot adjust stock. Result would be negative: ${newQuantity}`);
      }

      // Cập nhật quantity
      await tx.product_variants.update({
        where: { variant_id: variantId },
        data: { quantity: newQuantity },
      });

      // Ghi transaction
      const transaction = await tx.inventory_transactions.create({
        data: {
          variant_id: variantId,
          change_quantity: changeQuantity,
          reason: reason,
        },
      });

      return {
        variant_id: variantId,
        sku: variant.sku,
        old_quantity: variant.quantity,
        change: changeQuantity,
        new_quantity: newQuantity,
        reason,
        transaction_id: transaction.inventory_id,
      };
    });
  }

  /**
   * Nhập hàng hàng loạt
   */
  async bulkStockAdjust(items: BulkStockAdjustDto[]): Promise<BulkStockAdjustResponseDto> {
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          return await this.adjustStock(
            item.variantId,
            item.quantity,
            item.reason || 'Bulk adjustment',
          );
        } catch (error) {
          return {
            variantId: item.variantId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    const successful = results.filter((r): r is AdjustStockResponseDto => !('error' in r));
    const failed = results.filter((r): r is { variantId: number; error: string } => 'error' in r);

    return {
      total: items.length,
      successful: successful.length,
      failed: failed.length,
      results: {
        successful,
        failed,
      },
    };
  }

  /**
   * Update threshold cho 1 variant
   */
  async updateThreshold(variantId: number, dto: UpdateThresholdDto) {
    const variant = await this.prisma.product_variants.findUnique({
      where: { variant_id: variantId },
      select: {
        variant_id: true,
        sku: true,
        quantity: true,
        products: {
          select: { product_name: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} không tồn tại`);
    }

    const updated = await this.prisma.product_variants.update({
      where: { variant_id: variantId },
      data: {
        low_stock_threshold: dto.low_stock_threshold,
      },
    });

    return {
      success: true,
      message: 'Cập nhật ngưỡng cảnh báo thành công',
      data: {
        variant_id: updated.variant_id,
        sku: updated.sku,
        product_name: variant.products.product_name,
        quantity: variant.quantity,
        low_stock_threshold: updated.low_stock_threshold,
        is_low_stock: variant.quantity <= updated.low_stock_threshold,
      },
    };
  }

  /**
   * Bulk update threshold cho nhiều variants
   */
  async bulkUpdateThreshold(dto: BulkUpdateThresholdDto) {
    const result = await this.prisma.product_variants.updateMany({
      where: {
        variant_id: { in: dto.variant_ids },
      },
      data: {
        low_stock_threshold: dto.low_stock_threshold,
      },
    });

    return {
      success: true,
      message: `Đã cập nhật ${result.count} sản phẩm`,
      updated_count: result.count,
    };
  }

  /**
   * Get low stock variants
   */
  async getLowStockVariants() {
    const variants = await this.prisma.product_variants.findMany({
      where: { status: true },
      include: {
        products: {
          include: { brands: true, categories: true },
        },
        sizes: true,
      },
      orderBy: { quantity: 'asc' },
    });

    return variants.filter((v) => v.quantity <= v.low_stock_threshold);
  }

  /**
   * Get low stock với raw SQL (vì Prisma không support compare 2 columns)
   */
  async getLowStockVariantsRaw() {
    const query = `
      SELECT 
        pv.variant_id,
        pv.sku,
        pv.quantity,
        pv.low_stock_threshold,
        pv.base_price,
        p.product_name,
        b.brand_name,
        c.category_name,
        s.size_label,
        CASE 
          WHEN pv.quantity = 0 THEN 'out_of_stock'
          WHEN pv.quantity <= pv.low_stock_threshold * 0.5 THEN 'critical'
          WHEN pv.quantity <= pv.low_stock_threshold THEN 'low'
          ELSE 'normal'
        END as alert_level,
        ROUND(pv.quantity::NUMERIC / NULLIF(pv.low_stock_threshold, 0) * 100, 2) as stock_percentage
      FROM "clothing_ecom".product_variants pv
      JOIN "clothing_ecom".products p ON pv.product_id = p.product_id
      LEFT JOIN "clothing_ecom".brands b ON p.brand_id = b.brand_id
      LEFT JOIN "clothing_ecom".categories c ON p.category_id = c.category_id
      LEFT JOIN "clothing_ecom".sizes s ON pv.size_id = s.size_id
      WHERE pv.status = true
        AND pv.quantity <= pv.low_stock_threshold
      ORDER BY pv.quantity ASC
      LIMIT 100
    `;

    return this.prisma.$queryRawUnsafe(query);
  }

  /**
   * Check single variant stock status
   */
  async getVariantStockStatus(variantId: number) {
    const variant = await this.prisma.product_variants.findUnique({
      where: { variant_id: variantId },
      select: {
        variant_id: true,
        sku: true,
        quantity: true,
        low_stock_threshold: true,
        base_price: true,
        products: {
          select: {
            product_name: true,
            brands: { select: { brand_name: true } },
          },
        },
        sizes: {
          select: { size_label: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} không tồn tại`);
    }

    const alertLevel =
      variant.quantity === 0
        ? 'out_of_stock'
        : variant.quantity <= variant.low_stock_threshold * 0.5
          ? 'critical'
          : variant.quantity <= variant.low_stock_threshold
            ? 'low'
            : 'normal';

    const stockPercentage =
      variant.low_stock_threshold > 0
        ? Math.round((variant.quantity / variant.low_stock_threshold) * 100)
        : 100;

    return {
      ...variant,
      alert_level: alertLevel,
      stock_percentage: stockPercentage,
      is_low_stock: variant.quantity <= variant.low_stock_threshold,
    };
  }

  /**
   * Get all variants with threshold info (for admin dashboard)
   */
  async getAllVariantsWithThreshold() {
    return this.prisma.product_variants.findMany({
      where: { status: true },
      select: {
        variant_id: true,
        sku: true,
        quantity: true,
        low_stock_threshold: true,
        base_price: true,
        products: {
          select: {
            product_name: true,
            brands: { select: { brand_name: true } },
            categories: { select: { category_name: true } },
          },
        },
        sizes: {
          select: { size_label: true, gender: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }
}
