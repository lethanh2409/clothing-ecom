import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FilterProductDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  brand_id?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  category_id?: number[];

  @IsOptional()
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  min_price?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  max_price?: number;
}
