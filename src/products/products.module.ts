import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { BrandsService } from './brands.services';
import { BrandsController } from './brands.controller';
import { CategoriesService } from './categories.services';
import { CategoriesController } from './categories.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Module({
  imports: [CloudinaryModule, PrismaModule],
  providers: [
    ProductsService,
    BrandsService,
    CategoriesService,
    CloudinaryService,
    EmbeddingService,
  ],
  controllers: [ProductsController, BrandsController, CategoriesController],
  exports: [ProductsService],
})
export class ProductsModule {}
