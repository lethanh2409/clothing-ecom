import { Controller, Get, Query } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { Public } from '../auth/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Public()
  @Get('return')
  async paymentReturn(@Query() query: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.vnpayService.verifyAndProcessReturn(query);
  }
}
