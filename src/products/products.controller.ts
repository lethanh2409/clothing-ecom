import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products/:id/variants
  @Get(':id/variants')
  async getVariants(@Param('id') id: string) {
    const variants = await this.productsService.getVariants(+id);
    return {
      success: true,
      productId: id,
      count: variants.length,
      data: variants,
    };
  }

  // GET /products/variants/all
  @Get('variants/all')
  async getAllVariants() {
    const variants = await this.productsService.getAllVariants();
    return {
      success: true,
      count: variants.length,
      data: variants,
    };
  }
}
