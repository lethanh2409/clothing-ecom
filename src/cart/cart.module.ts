// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartDetail } from './entities/cart-detail.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductVariant } from '../products/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartDetail, ProductVariant])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
