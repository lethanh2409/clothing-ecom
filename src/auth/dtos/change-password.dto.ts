// dto/change-password.dto.ts
import { IsString, MinLength, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  old_password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  new_password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  confirm_new_password: string;

  @IsOptional()
  @IsEmail()
  email?: string; // dùng khi reset mật khẩu (quên mật khẩu)
}
