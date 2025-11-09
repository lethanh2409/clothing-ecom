import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { Public } from 'src/auth/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Public()
  @Post('send')
  @Post('send')
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.otpService.send(dto.email, dto.purpose);
    return {
      statusCode: 200,
      success: true,
      message: 'Đã gửi OTP! Vui lòng kiểm tra email',
    };
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác minh mã OTP' })
  @ApiResponse({
    status: 200,
    description: 'Xác minh thành công',
    schema: {
      example: {
        success: true,
        message: 'Xác minh OTP thành công',
      },
    },
  })
  async verify(@Body() dto: VerifyOtpDto) {
    const result = await this.otpService.verify(dto.email, dto.code, dto.purpose);
    return result;
  }
}
