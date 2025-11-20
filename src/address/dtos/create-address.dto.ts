import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @Length(1, 100)
  consignee_name: string;

  @IsString()
  @Length(8, 20)
  consignee_phone: string;

  // GHN province
  @IsString() province: string;
  @IsString() province_id: string;

  // GHN district
  @IsString() district: string;
  @IsString() district_id: string;

  // GHN ward
  @IsString() ward: string;
  @IsString() ward_id: string;

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
