import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /admin/products
  @Get('admin')
  async getAllProducts() {
    const variants = await this.productsService.getAllProductsWithFirstVariant();
    return {
      success: true,
      count: variants.length,
      data: variants,
    };
  }

  // GET /products/customer
  @Get()
  async getProductsForCustomer() {
    const variants = await this.productsService.getProductsByStatus();
    return {
      success: true,
      count: variants.length,
      data: variants,
    };
  }

  @Get('brand/:brandId')
  async getProductsByBrand(@Param('brandId') brandId: number) {
    const products = await this.productsService.getProductsByBrand(brandId);
    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  @Get('category/:categoryId')
  async getProductsByCategory(@Param('categoryId') categoryId: number) {
    const products = await this.productsService.getProductsByCategory(categoryId);
    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  @Get('new')
  async getNewProducts() {
    const products = await this.productsService.getNewProducts();
    return { success: true, count: products.length, data: products };
  }

  @Get('/popular')
  async getPopularProducts() {
    const products = await this.productsService.getPopularProducts();
    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  // products.controller.ts
  @Get(':id')
  async getProductById(@Param('id') id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const product = await this.productsService.getProductById(id);
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: product,
    };
  }
}
