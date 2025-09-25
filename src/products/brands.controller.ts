// src/brands/brands.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BrandsService } from './brands.services';

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
}
