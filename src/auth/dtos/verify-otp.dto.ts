import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';
export class VerifyOtpDto {
  @IsEmail() email!: string;
  @IsNotEmpty() code!: string;
  @IsIn(['register', 'reset']) purpose!: string;
}
