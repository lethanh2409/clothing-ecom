// src/inventory/dtos/export-inventory.dto.ts
import { IsDateString, IsOptional, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportInventoryDto {
  @IsDateString()
  date: string; // Format: YYYY-MM-DD

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  variant_ids?: number[]; // Optional: filter specific variants

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category_id?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  brand_id?: number;
}

export class ExportInventoryRangeDto {
  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  variant_ids?: number[];
}
