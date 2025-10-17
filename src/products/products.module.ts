import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { BrandsService } from './brands.services';
import { BrandsController } from './brands.controller';
import { CategoriesService } from './categories.services';
import { CategoriesController } from './categories.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [CloudinaryModule],
  providers: [ProductsService, BrandsService, CategoriesService, CloudinaryService],
  controllers: [ProductsController, BrandsController, CategoriesController],
})
export class ProductsModule {}
