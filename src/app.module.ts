import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { LookbooksModule } from './lookbooks/lookbooks.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';
import { VnpayService } from './payment/vnpay.service';
import { ReviewsModule } from './reviews/reviews.module';
import { AddressModule } from './address/address.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Load .env sớm, global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // hoặc đường dẫn tuyệt đối nếu không cùng thư mục
    }),

    AuthModule,

    ProductsModule,

    OrdersModule,

    CartModule,

    LookbooksModule,

    VouchersModule,

    PrismaModule,

    PaymentModule,

    ReviewsModule,

    AddressModule,

    CloudinaryModule,

    MailModule,
  ],
  providers: [
    VnpayService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
