import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @Length(1, 100)
  consignee_name: string;

  @IsString()
  @Length(8, 20)
  consignee_phone: string;

  @IsString() province: string;
  @IsString() district: string;
  @IsString() ward: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  house_num?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean; // mặc định false nếu không truyền
}
