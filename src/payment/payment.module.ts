import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { PaymentController } from './payment.controller';

@Module({
  providers: [VnpayService],
  exports: [VnpayService],
  controllers: [PaymentController],
})
export class PaymentModule {}
