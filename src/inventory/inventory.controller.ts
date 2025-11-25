// src/inventory/inventory.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorate';
import {
  GetInventoryAtDateDto,
  GetMonthlyInventoryDto,
  GetBulkInventoryDto,
  GetChangeReportDto,
  GetVariantTransactionsDto,
  GetLowStockDto,
  AdjustStockDto,
  BulkStockAdjustRequestDto,
} from './dtos/inventory-request.dto';
import { BulkUpdateThresholdDto, UpdateThresholdDto } from './dtos/update-threshold.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Lấy tồn kho của 1 variant tại thời điểm cụ thể
   * GET /inventory/variants/:id/at-date?date=2025-01-15
   */
  @Get('variants/:id/at-date')
  @Roles('ADMIN', 'STAFF')
  async getInventoryAtDate(
    @Param('id', ParseIntPipe) variantId: number,
    @Query() dto: GetInventoryAtDateDto,
  ) {
    try {
      if (!dto.date) {
        throw new BadRequestException('Thiếu tham số date (yyyy-MM-dd)');
      }

      const date = new Date(dto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          'Ngày không hợp lệ. Định dạng đúng: yyyy-MM-dd (VD: 2025-01-15)',
        );
      }

      const result = await this.inventoryService.getInventoryAtDate(variantId, date);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể lấy tồn kho',
      );
    }
  }

  /**
   * Lấy lịch sử tồn kho theo tháng
   * GET /inventory/variants/:id/monthly?month=1&year=2025
   */
  @Get('variants/:id/monthly')
  @Roles('ADMIN', 'STAFF')
  async getMonthlyInventory(
    @Param('id', ParseIntPipe) variantId: number,
    @Query() dto: GetMonthlyInventoryDto,
  ) {
    try {
      const month = Number(dto.month);
      const year = Number(dto.year);

      if (!month || !year) {
        throw new BadRequestException('Thiếu tham số month và year');
      }

      if (month < 1 || month > 12) {
        throw new BadRequestException('Tháng phải từ 1-12');
      }

      if (year < 2000 || year > 2100) {
        throw new BadRequestException('Năm không hợp lệ (2000-2100)');
      }

      const result = await this.inventoryService.getMonthlyInventory(variantId, month, year);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể lấy lịch sử tồn kho',
      );
    }
  }

  /**
   * Lấy tồn kho của nhiều variants tại 1 thời điểm
   * POST /inventory/bulk-at-date
   */
  @Post('bulk-at-date')
  @Roles('ADMIN', 'STAFF')
  async getBulkInventoryAtDate(@Body() dto: GetBulkInventoryDto) {
    try {
      if (!dto.variantIds || dto.variantIds.length === 0) {
        throw new BadRequestException('Thiếu danh sách variantIds');
      }

      if (dto.variantIds.length > 100) {
        throw new BadRequestException('Tối đa 100 variants mỗi lần');
      }

      if (!dto.date) {
        throw new BadRequestException('Thiếu tham số date (yyyy-MM-dd)');
      }

      const date = new Date(dto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          'Ngày không hợp lệ. Định dạng đúng: yyyy-MM-dd (VD: 2025-01-15)',
        );
      }

      const result = await this.inventoryService.getBulkInventoryAtDate(dto.variantIds, date);
      return {
        success: true,
        count: result.length,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể lấy tồn kho hàng loạt',
      );
    }
  }

  /**
   * Báo cáo biến động tồn kho theo khoảng thời gian
   * GET /inventory/reports/changes?startDate=2025-01-01&endDate=2025-01-31
   */
  @Get('reports/changes')
  @Roles('ADMIN', 'STAFF')
  async getChangeReport(@Query() dto: GetChangeReportDto) {
    try {
      if (!dto.startDate || !dto.endDate) {
        throw new BadRequestException('Thiếu startDate hoặc endDate (yyyy-MM-dd)');
      }

      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException(
          'Ngày không hợp lệ. Định dạng đúng: yyyy-MM-dd (VD: 2025-01-15)',
        );
      }

      if (startDate > endDate) {
        throw new BadRequestException('startDate phải nhỏ hơn hoặc bằng endDate');
      }

      // Giới hạn tối đa 1 năm
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        throw new BadRequestException('Khoảng thời gian tối đa là 365 ngày');
      }

      const result = await this.inventoryService.getChangeReport(startDate, endDate);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể tạo báo cáo',
      );
    }
  }

  /**
   * Lấy chi tiết transactions của 1 variant
   * GET /inventory/variants/:id/transactions?startDate=2025-01-01&endDate=2025-01-31&limit=100
   */
  @Get('variants/:id/transactions')
  @Roles('ADMIN', 'STAFF')
  async getVariantTransactions(
    @Param('id', ParseIntPipe) variantId: number,
    @Query() dto: GetVariantTransactionsDto,
  ) {
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      const limit = dto.limit ? Number(dto.limit) : 100;

      if (dto.startDate) {
        startDate = new Date(dto.startDate);
        if (isNaN(startDate.getTime())) {
          throw new BadRequestException('startDate không hợp lệ. Định dạng đúng: yyyy-MM-dd');
        }
      }

      if (dto.endDate) {
        endDate = new Date(dto.endDate);
        if (isNaN(endDate.getTime())) {
          throw new BadRequestException('endDate không hợp lệ. Định dạng đúng: yyyy-MM-dd');
        }
      }

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('startDate phải nhỏ hơn hoặc bằng endDate');
      }

      if (limit < 1 || limit > 1000) {
        throw new BadRequestException('limit phải từ 1-1000');
      }

      const result = await this.inventoryService.getVariantTransactions(
        variantId,
        startDate,
        endDate,
        limit,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể lấy lịch sử giao dịch',
      );
    }
  }

  /**
   * Lấy danh sách variants có tồn kho thấp
   * GET /inventory/alerts/low-stock?threshold=10
   */
  @Get('alerts/low-stock')
  @Roles('ADMIN', 'STAFF')
  async getLowStockVariants(@Query() dto: GetLowStockDto) {
    try {
      const threshold = dto.threshold ? Number(dto.threshold) : 10;

      if (threshold < 0) {
        throw new BadRequestException('threshold phải >= 0');
      }

      if (threshold > 1000) {
        throw new BadRequestException('threshold tối đa là 1000');
      }

      const result = await this.inventoryService.getLowStockVariants();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể lấy danh sách tồn kho thấp',
      );
    }
  }

  /**
   * Lấy variants hết hàng
   * GET /inventory/alerts/out-of-stock
   */
  @Get('alerts/out-of-stock')
  @Roles('ADMIN', 'STAFF')
  async getOutOfStockVariants() {
    try {
      const result = await this.inventoryService.getOutOfStockVariants();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể lấy danh sách hết hàng',
      );
    }
  }

  /**
   * Điều chỉnh tồn kho (nhập/xuất thủ công)
   * POST /inventory/variants/:id/adjust
   */
  @Post('variants/:id/adjust')
  @Roles('ADMIN')
  async adjustStock(@Param('id', ParseIntPipe) variantId: number, @Body() dto: AdjustStockDto) {
    try {
      if (dto.quantity === 0) {
        throw new BadRequestException('Số lượng không được bằng 0');
      }

      if (Math.abs(dto.quantity) > 10000) {
        throw new BadRequestException('Số lượng điều chỉnh tối đa là ±10,000');
      }

      if (!dto.reason || dto.reason.trim().length === 0) {
        throw new BadRequestException('Phải cung cấp lý do điều chỉnh');
      }

      if (dto.reason.length > 255) {
        throw new BadRequestException('Lý do không được quá 255 ký tự');
      }

      const result = await this.inventoryService.adjustStock(
        variantId,
        dto.quantity,
        dto.reason.trim(),
      );

      return {
        success: true,
        message: `Điều chỉnh tồn kho thành công: ${dto.quantity > 0 ? '+' : ''}${dto.quantity}`,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể điều chỉnh tồn kho',
      );
    }
  }

  /**
   * Nhập hàng hàng loạt
   * POST /inventory/bulk-adjust
   */
  @Post('bulk-adjust')
  @Roles('ADMIN')
  async bulkStockAdjust(@Body() dto: BulkStockAdjustRequestDto) {
    try {
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('Danh sách items không được rỗng');
      }

      if (dto.items.length > 100) {
        throw new BadRequestException('Tối đa 100 items mỗi lần');
      }

      // Validate từng item
      dto.items.forEach((item, index) => {
        if (!item.variantId) {
          throw new BadRequestException(`Item ${index + 1}: Thiếu variantId`);
        }
        if (item.quantity === 0) {
          throw new BadRequestException(`Item ${index + 1}: Số lượng không được bằng 0`);
        }
        if (Math.abs(item.quantity) > 10000) {
          throw new BadRequestException(`Item ${index + 1}: Số lượng điều chỉnh tối đa là ±10,000`);
        }
        if (item.reason && item.reason.length > 255) {
          throw new BadRequestException(`Item ${index + 1}: Lý do không được quá 255 ký tự`);
        }
      });

      const result = await this.inventoryService.bulkStockAdjust(dto.items);
      return {
        success: true,
        message: `Điều chỉnh hàng loạt: ${result.successful}/${result.total} thành công`,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể điều chỉnh hàng loạt',
      );
    }
  }

  //** Update threshold for a variant
  @Put('variants/:id/threshold')
  async updateThreshold(
    @Param('id', ParseIntPipe) variantId: number,
    @Body() dto: UpdateThresholdDto,
  ) {
    return this.inventoryService.updateThreshold(variantId, dto);
  }

  /**
   * Bulk update threshold
   * POST /inventory/variants/bulk-update-threshold
   */
  @Post('variants/bulk-update-threshold')
  async bulkUpdateThreshold(@Body() dto: BulkUpdateThresholdDto) {
    return this.inventoryService.bulkUpdateThreshold(dto);
  }

  /**
   * Get low stock variants
   * GET /inventory/low-stock
   */
  @Get('low-stock')
  async getLowStock() {
    return this.inventoryService.getLowStockVariantsRaw();
  }

  /**
   * Get single variant status
   * GET /inventory/variants/:id/status
   */
  @Get('variants/:id/status')
  async getVariantStatus(@Param('id', ParseIntPipe) variantId: number) {
    return this.inventoryService.getVariantStockStatus(variantId);
  }

  /**
   * Get all variants with threshold (for admin dashboard)
   * GET /inventory/variants
   */
  @Get('variants')
  async getAllVariants() {
    return this.inventoryService.getAllVariantsWithThreshold();
  }
}
