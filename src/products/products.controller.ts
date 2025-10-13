import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

type ListResponse = { success: true; count: number; data: any[] };
type ItemResponse = { success: true; data: any };

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products/admin
  @Get('admin')
  async getAllProducts(): Promise<ListResponse> {
    const items = await this.productsService.getAllProductsWithFirstVariant();
    return { success: true, count: items.length, data: items };
  }

  // GET /products
  @Get()
  async getProductsForCustomer(): Promise<ListResponse> {
    const items = await this.productsService.getProductsByStatus();
    return { success: true, count: items.length, data: items };
  }

  // GET /products/brand/:brandId
  @Get('brand/:brandId')
  async getProductsByBrand(@Param('brandId', ParseIntPipe) brandId: number): Promise<ListResponse> {
    const items = await this.productsService.getProductsByBrand(brandId);
    return { success: true, count: items.length, data: items };
  }

  // GET /products/category/:categoryId
  @Get('category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<ListResponse> {
    const items = await this.productsService.getProductsByCategory(categoryId);
    return { success: true, count: items.length, data: items };
  }

  // GET /products/new
  @Get('new')
  async getNewProducts(): Promise<ListResponse> {
    const items = await this.productsService.getNewProducts();
    return { success: true, count: items.length, data: items };
  }

  // GET /products/popular
  @Get('popular')
  async getPopularProducts(): Promise<ListResponse> {
    const items = await this.productsService.getPopularProducts();
    return { success: true, count: items.length, data: items };
  }

  // GET /products/:id  (đặt sau các route tĩnh)
  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number): Promise<ItemResponse> {
    const product = await this.productsService.getProductById(id);
    return { success: true, data: product };
  }
}
