// src/brands/brands.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BrandsService } from './brands.services';
import { Roles } from 'src/auth/roles.decorate';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get('admin')
  async getAll() {
    return {
      success: true,
      data: await this.brandsService.getAllBrands(),
    };
  }

  @Get()
  async getActive() {
    return {
      success: true,
      data: await this.brandsService.getBrandsByStatus(),
    };
  }

  // --- ADMIN CRUD ---
  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async softDelete(@Param('id') id: string) {
    return this.brandsService.softDelete(+id);
  }
}
