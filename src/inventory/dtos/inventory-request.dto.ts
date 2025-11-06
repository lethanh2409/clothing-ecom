// src/inventory/dtos/inventory-request.dto.ts
import {
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// SNAPSHOT MANAGEMENT DTOs
// ============================================

export class CreateSnapshotDto {
  @IsOptional()
  @IsString({ message: 'Ngày phải là chuỗi định dạng yyyy-MM-dd' })
  date?: string; // yyyy-MM-dd
}

export class CleanSnapshotsDto {
  @IsOptional()
  @IsInt({ message: 'keepDays phải là số nguyên' })
  @Min(1, { message: 'keepDays phải >= 1' })
  @Type(() => Number)
  keepDays?: number;
}

// ============================================
// HISTORICAL QUERIES DTOs
// ============================================

export class GetInventoryAtDateDto {
  @IsString({ message: 'date phải là chuỗi định dạng yyyy-MM-dd' })
  @IsNotEmpty({ message: 'date không được để trống' })
  date: string; // yyyy-MM-dd
}

export class GetMonthlyInventoryDto {
  @IsInt({ message: 'month phải là số nguyên' })
  @Min(1, { message: 'month phải từ 1-12' })
  @Max(12, { message: 'month phải từ 1-12' })
  @Type(() => Number)
  month: number;

  @IsInt({ message: 'year phải là số nguyên' })
  @Min(2000, { message: 'year phải >= 2000' })
  @Max(2100, { message: 'year phải <= 2100' })
  @Type(() => Number)
  year: number;
}

export class GetBulkInventoryDto {
  @IsArray({ message: 'variantIds phải là mảng' })
  @ArrayMinSize(1, { message: 'variantIds phải có ít nhất 1 phần tử' })
  @ArrayMaxSize(100, { message: 'variantIds tối đa 100 phần tử' })
  @IsInt({ each: true, message: 'Mỗi variantId phải là số nguyên' })
  @Type(() => Number)
  variantIds: number[];

  @IsString({ message: 'date phải là chuỗi định dạng yyyy-MM-dd' })
  @IsNotEmpty({ message: 'date không được để trống' })
  date: string; // yyyy-MM-dd
}

// ============================================
// TRANSACTION REPORTS DTOs
// ============================================

export class GetChangeReportDto {
  @IsString({ message: 'startDate phải là chuỗi định dạng yyyy-MM-dd' })
  @IsNotEmpty({ message: 'startDate không được để trống' })
  startDate: string; // yyyy-MM-dd

  @IsString({ message: 'endDate phải là chuỗi định dạng yyyy-MM-dd' })
  @IsNotEmpty({ message: 'endDate không được để trống' })
  endDate: string; // yyyy-MM-dd
}

export class GetVariantTransactionsDto {
  @IsOptional()
  @IsString({ message: 'startDate phải là chuỗi định dạng yyyy-MM-dd' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'endDate phải là chuỗi định dạng yyyy-MM-dd' })
  endDate?: string;

  @IsOptional()
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải >= 1' })
  @Max(1000, { message: 'limit phải <= 1000' })
  @Type(() => Number)
  limit?: number;
}

// ============================================
// STOCK ALERTS DTOs
// ============================================

export class GetLowStockDto {
  @IsOptional()
  @IsInt({ message: 'threshold phải là số nguyên' })
  @Min(0, { message: 'threshold phải >= 0' })
  @Type(() => Number)
  threshold?: number;
}

// ============================================
// STOCK ADJUSTMENT DTOs
// ============================================

export class AdjustStockDto {
  @IsInt({ message: 'quantity phải là số nguyên' })
  @IsNotEmpty({ message: 'quantity không được để trống' })
  quantity: number; // Dương = nhập, Âm = xuất

  @IsString({ message: 'reason phải là chuỗi' })
  @IsNotEmpty({ message: 'reason không được để trống' })
  reason: string;
}

export class BulkStockAdjustItemDto {
  @IsInt({ message: 'variantId phải là số nguyên' })
  @IsNotEmpty({ message: 'variantId không được để trống' })
  variantId: number;

  @IsInt({ message: 'quantity phải là số nguyên' })
  @IsNotEmpty({ message: 'quantity không được để trống' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'reason phải là chuỗi' })
  reason?: string;
}

export class BulkStockAdjustRequestDto {
  @IsArray({ message: 'items phải là mảng' })
  @ArrayMinSize(1, { message: 'items phải có ít nhất 1 phần tử' })
  @ArrayMaxSize(100, { message: 'items tối đa 100 phần tử' })
  @ValidateNested({ each: true })
  @Type(() => BulkStockAdjustItemDto)
  items: BulkStockAdjustItemDto[];
}
