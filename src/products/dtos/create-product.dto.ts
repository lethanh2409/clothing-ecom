// src/products/dtos/create-product.dto.ts
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantAssetDto {
  @IsString() url: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsBoolean() is_primary?: boolean;
}

export class CreateVariantDto {
  @IsInt() @Type(() => Number) size_id: number;
  @IsString() @IsNotEmpty() color: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsNumber() @Type(() => Number) base_price?: number;
  @IsOptional() @IsNumber() @Type(() => Number) cost_price?: number;
  @IsOptional() @IsInt() @Type(() => Number) quantity?: number;
}

export class CreateProductDto {
  @IsOptional() @IsInt() @Type(() => Number) brand_id?: number;
  @IsOptional() @IsInt() @Type(() => Number) category_id?: number;
  @IsString() @IsNotEmpty() product_name: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'] as const)
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
