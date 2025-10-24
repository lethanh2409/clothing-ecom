import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ExportService } from './export.service';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [OrdersController],
  providers: [OrdersService, ExportService],
  exports: [OrdersService],
})
export class OrdersModule {}
