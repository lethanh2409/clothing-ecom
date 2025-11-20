import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  consignee_name?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  consignee_phone?: string;

  @IsOptional()
  @IsString()
  province?: string;
  @IsOptional()
  @IsString()
  province_id?: string;

  @IsOptional()
  @IsString()
  district?: string;
  @IsOptional()
  @IsString()
  district_id?: string;

  @IsOptional()
  @IsString()
  ward?: string;
  @IsOptional()
  @IsString()
  ward_id?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  house_num?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
