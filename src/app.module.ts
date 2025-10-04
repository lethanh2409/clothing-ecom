import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { LookbooksModule } from './lookbooks/lookbooks.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';
import { VnpayService } from './payment/vnpay.service';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    // Load .env sớm, global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // hoặc đường dẫn tuyệt đối nếu không cùng thư mục
    }),

    // Load DB config từ .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, HealthModule, UsersModule, AuthModule, ProductsModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('DB_PORT in factory:', config.get('DB_PORT'));
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USER'),
          password: config.get('DB_PASS'),
          database: config.get('DB_NAME'),
          schema: config.get('DB_SCHEMA'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    ProductsModule,

    OrdersModule,

    CartModule,

    LookbooksModule,

    VouchersModule,

    PrismaModule,

    PaymentModule,

    ReviewsModule,
  ],
  providers: [VnpayService],
})
export class AppModule {}
