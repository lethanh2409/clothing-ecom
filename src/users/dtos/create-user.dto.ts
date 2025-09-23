import { IsString, IsEmail, IsOptional, MinLength, IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johnsmith' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of role IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  role_ids?: number[];
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'johnsmith' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  birthday?: Date;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string;
}
