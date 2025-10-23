// send-otp.dto.ts
import { IsEmail, IsIn, IsOptional } from 'class-validator';
export class SendOtpDto {
  @IsEmail() email!: string;
  @IsOptional() @IsIn(['register', 'reset']) purpose?: string;
}
