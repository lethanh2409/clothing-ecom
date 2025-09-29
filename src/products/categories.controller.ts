// src/products/categories.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.services';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // GET /categories/admin → admin xem tất cả
  @Get('/admin')
  async getAll() {
    return {
      success: true,
      data: await this.categoriesService.getAllCategories(),
    };
  }

  // GET /categories/active → FE hiển thị danh mục đang active
  @Get()
  async getActive() {
    return {
      success: true,
      data: await this.categoriesService.getCategoriesByStatus(),
    };
  }

  // GET /categories/parents
  @Get('parents')
  getParentCategories() {
    return this.categoriesService.getParentCategories();
  }

  // GET /categories/:id/sub
  @Get(':id/sub')
  getSubCategories(@Param('id') id: number) {
    return this.categoriesService.getSubCategories(id);
  }
}
