// src/users/dtos/update-profile.dto.ts
import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsIn,
  Length,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  full_name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)',
  })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ (YYYY-MM-DD)' })
  birthday?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'], {
    message: 'Giới tính phải là: male, female hoặc other',
  })
  gender?: string;
}
