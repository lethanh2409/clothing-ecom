import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorate';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

type ListResponse<T = any> = {
  success: true;
  count: number;
  data: T[];
  page?: number;
  limit?: number;
};
type ItemResponse<T = any> = { success: true; data: T };

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ======== GET ========
  @Public()
  @Get('admin')
  async getAllProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<ListResponse> {
    const items = await this.productsService.getAllProductsWithVariants();
    const start = (page - 1) * limit;
    return {
      success: true,
      count: items.length,
      data: items.slice(start, start + limit),
      page,
      limit,
    };
  }

  @Public()
  @Get()
  async getProductsForCustomer(
    @Query('status', new DefaultValuePipe('ACTIVE')) status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK',
  ): Promise<ListResponse> {
    const items = await this.productsService.getProductsByStatus(status);
    return { success: true, count: items.length, data: items };
  }

  @Public()
  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number): Promise<ItemResponse> {
    const product = await this.productsService.getProductById(id);
    return { success: true, data: product };
  }

  // ======== CREATE / UPDATE / DELETE (KHÔNG xử lý ảnh ở đây) ========
  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateProductDto): Promise<ItemResponse> {
    console.log('[POST /products] body =', JSON.stringify(dto)); // <-- log trước
    const data = await this.productsService.createProductWithVariants(dto);
    console.log('[POST /products] result =', data?.product_id);
    return { success: true, data };
  }

  @Patch(':id')
  // @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ItemResponse> {
    const data = await this.productsService.updateProductAndVariants(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  // @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productsService.deleteProduct(id);
    return { success: true, data };
  }

  // ======== VARIANT ASSETS (upload SAU khi tạo) ========
  // 1 file
  @Post('variants/:id/assets')
  @UseInterceptors(FileInterceptor('file')) // field: file
  // @Roles('ADMIN')
  async uploadAsset(
    @Param('id', ParseIntPipe) variantId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPrimary') isPrimary?: string,
  ) {
    const created = await this.productsService.uploadVariantAsset(
      variantId,
      file,
      isPrimary === 'true',
    );
    return { success: true, data: created };
  }

  // nhiều file 1 lần (file đầu tiên làm primary)
  @Post('variants/:id/assets/batch')
  @UseInterceptors(FilesInterceptor('files')) // field: files
  // @Roles('ADMIN')
  async uploadAssetsBatch(
    @Param('id', ParseIntPipe) variantId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const data = await this.productsService.uploadVariantAssetsBatch(variantId, files);
    return { success: true, data };
  }

  // src/products/products.controller.ts
  @Patch('variants/:id/assets/primary')
  async setPrimary(
    @Param('id', ParseIntPipe) variantId: number,
    @Body('asset_id', ParseIntPipe) assetId: number, // 👈 ép thành number, nếu thiếu sẽ 400
  ) {
    const res = await this.productsService.setPrimaryAsset(variantId, assetId);
    return { success: true, data: res };
  }

  @Delete('variants/:variantId/assets/:assetId')
  // @Roles('ADMIN')
  async deleteAsset(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
  ) {
    const res = await this.productsService.deleteVariantAsset(variantId, assetId);
    return { success: true, data: res };
  }
}
