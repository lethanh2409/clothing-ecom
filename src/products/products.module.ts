import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VariantAsset } from './entities/variant-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, VariantAsset])],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
