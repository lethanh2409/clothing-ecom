// src/brands/brands.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { BrandsService } from './brands.services';
import { Roles } from 'src/auth/roles.decorate';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get('admin')
  @Roles('ADMIN')
  async getAll() {
    return { success: true, data: await this.brandsService.getAllBrands() };
  }

  @Public()
  @Get()
  async getActive() {
    return { success: true, data: await this.brandsService.getBrandsByStatus() };
  }

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return { success: true, data: await this.brandsService.getBrandById(id) };
  }

  // --- ADMIN CRUD ---
  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('logo')) // field name = 'logo'
  async create(@Body() dto: CreateBrandDto, @UploadedFile() logo?: Express.Multer.File) {
    return this.brandsService.create(dto, logo);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.brandsService.update(id, dto, logo);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.softDelete(id);
  }
}
