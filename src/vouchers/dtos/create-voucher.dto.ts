import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsIn } from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['percent', 'fixed'])
  discount_type: 'percent' | 'fixed';

  @IsNumber()
  discount_value: number;

  @IsOptional()
  @IsNumber()
  min_order_value?: number;

  @IsOptional()
  @IsNumber()
  max_discount?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  per_customer_limit?: number;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
