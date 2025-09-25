import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /admin/products
  @Get('admin/products')
  async getAllProducts() {
    const variants = await this.productsService.getAllProductsWithFirstVariant();
    return {
      success: true,
      count: variants.length,
      data: variants,
    };
  }

  // GET /products/customer
  @Get('products')
  async getProductsForCustomer() {
    const variants = await this.productsService.getProductsByStatus();
    return {
      success: true,
      count: variants.length,
      data: variants,
    };
  }

  @Get('products/brand/:brandId')
  async getProductsByBrand(@Param('brandId') brandId: number) {
    const products = await this.productsService.getProductsByBrand(brandId);
    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  @Get('products/category/:categoryId')
  async getProductsByCategory(@Param('categoryId') categoryId: number) {
    const products = await this.productsService.getProductsByCategory(categoryId);
    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  // products.controller.ts
  @Get('products/:id')
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
