import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otp: OtpService) {}

  @Public()
  @Post('send')
  async send(@Body() dto: SendOtpDto) {
    const purpose = dto.purpose ?? 'register';
    await this.otp.send(dto.email, purpose);
    // Không spread để tránh trùng 'success'
    return { success: true };
  }

  @Public()
  @Post('verify')
  async verify(@Body() dto: VerifyOtpDto) {
    const { otp_token } = await this.otp.verify(dto.email, dto.code, dto.purpose);
    return { success: true, otp_token };
  }
}
