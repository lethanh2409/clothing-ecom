// src/products/dtos/update-product.dto.ts
// src/products/dtos/update-product.dto.ts
import { IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertVariantDto {
  @IsOptional() @IsInt() @Type(() => Number) variant_id?: number;
  @IsOptional() @IsInt() @Type(() => Number) size_id?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsNumber() @Type(() => Number) base_price?: number;
  @IsOptional() @IsNumber() @Type(() => Number) cost_price?: number;
  @IsOptional() @IsInt() @Type(() => Number) quantity?: number;
}

export class UpdateProductBodyDto {
  @IsOptional() @IsInt() brand_id?: number;
  @IsOptional() @IsInt() category_id?: number;
  @IsOptional() @IsString() product_name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
}

export class UpdateProductDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProductBodyDto)
  product?: UpdateProductBodyDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertVariantDto)
  variantsToUpsert?: UpsertVariantDto[];

  @IsOptional()
  @IsArray()
  variantIdsToDelete?: number[];
}
