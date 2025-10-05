import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  consignee_name: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  consignee_phone: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'Phường Bến Nghé' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ward: string;

  @ApiPropertyOptional({ example: 'Lê Thánh Tôn' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  street?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  house_num?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  consignee_name?: string;

  @ApiPropertyOptional({ example: '0907654321' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  consignee_phone?: string;

  @ApiPropertyOptional({ example: 'TP. Hà Nội' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: 'Quận Ba Đình' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: 'Phường Điện Biên' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({ example: 'Hoàng Diệu' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  street?: string;

  @ApiPropertyOptional({ example: '456' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  house_num?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
