// src/products/categories.controller.ts
import { Controller, Get, Param, Post, Patch, Delete, Body, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.services';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Roles } from 'src/auth/roles.decorate';
import { Public } from 'src/auth/public.decorator';

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

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return { success: true, data: await this.categoriesService.getCategoryById(id) };
  }

  // --- ADMIN CRUD ---
  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async softDelete(@Param('id') id: string) {
    return this.categoriesService.softDelete(+id);
  }
}
