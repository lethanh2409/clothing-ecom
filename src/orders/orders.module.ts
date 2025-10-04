import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/order-detail.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentModule } from 'src/payment/payment.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail]), PrismaModule, PaymentModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
