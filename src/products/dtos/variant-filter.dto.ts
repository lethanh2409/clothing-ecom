// src/products/dtos/variant-filter.dto.ts

import { IsOptional, IsInt, IsBoolean, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class VariantFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brand_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  low_stock?: number;
}
