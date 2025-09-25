import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VariantAsset } from './entities/variant-asset.entity';
import { Brand } from './entities/brand.entity';
import { BrandsService } from './brands.services';
import { BrandsController } from './brands.controller';
import { CategoriesService } from './categories.services';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, VariantAsset, Brand, Category])],
  providers: [ProductsService, BrandsService, CategoriesService],
  controllers: [ProductsController, BrandsController, CategoriesController],
})
export class ProductsModule {}
