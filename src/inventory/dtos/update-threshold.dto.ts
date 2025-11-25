import { IsInt, Min, IsArray } from 'class-validator';

export class UpdateThresholdDto {
  @IsInt()
  @Min(1, { message: 'Threshold phải lớn hơn 0' })
  low_stock_threshold: number;
}

export class BulkUpdateThresholdDto {
  @IsArray()
  @IsInt({ each: true })
  variant_ids: number[];

  @IsInt()
  @Min(1)
  low_stock_threshold: number;
}
