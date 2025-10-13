import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { BrandsService } from './brands.services';
import { BrandsController } from './brands.controller';
import { CategoriesService } from './categories.services';
import { CategoriesController } from './categories.controller';

@Module({
  providers: [ProductsService, BrandsService, CategoriesService],
  controllers: [ProductsController, BrandsController, CategoriesController],
})
export class ProductsModule {}
