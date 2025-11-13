import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { LookbooksService } from './lookbooks.service';
import { CreateLookbookDto } from './dtos/create-lookbook.dto';
import { UpdateLookbookDto } from './dtos/update-lookbook.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorate';

@Controller('lookbooks')
export class LookbooksController {
  constructor(private readonly lookbooksService: LookbooksService) {}

  // =========================
  // 👥 CUSTOMER: chỉ xem lookbook ACTIVE
  // =========================
  @Public()
  @Get('active')
  getActive() {
    return this.lookbooksService.getActiveForCustomer();
  }

  // =========================
  // 🔍 GET ONE (ai cũng xem được)
  // =========================
  @Public()
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.lookbooksService.getOne(id);
  }

  // =========================
  // 🛠 ADMIN: GET ALL
  // =========================
  @Get()
  @Roles('ADMIN')
  getAll() {
    return this.lookbooksService.getAll();
  }

  // =========================
  // 🆕 CREATE LOOKBOOK
  // =========================
  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreateLookbookDto, @UploadedFile() image?: Express.Multer.File) {
    return this.lookbooksService.create(dto, image);
  }

  // =========================
  // ✏️ UPDATE LOOKBOOK
  // =========================
  @Patch(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLookbookDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.lookbooksService.update(id, dto, image);
  }

  // =========================
  // 🗑️ SOFT DELETE LOOKBOOK
  // =========================
  @Delete(':id')
  @Roles('ADMIN')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.lookbooksService.softDelete(id);
  }

  // =========================================
  // ✅ GET ITEMS (CUSTOMER)
  // =========================================
  @Get(':id/items')
  async getItemsForCustomer(@Param('id', ParseIntPipe) lookbookId: number) {
    return this.lookbooksService.getItemsForCustomer(lookbookId);
  }

  // =========================================
  // ✅ GET ITEMS (ADMIN)
  // =========================================
  @Roles('ADMIN', 'STAFF')
  @Get('admin/:id/items')
  async getItemsAdmin(@Param('id', ParseIntPipe) lookbookId: number) {
    return this.lookbooksService.getItemsAdmin(lookbookId);
  }

  // =========================================
  // ✅ ADD MULTIPLE PRODUCTS
  // =========================================
  @Roles('ADMIN')
  @Post(':id/items')
  async addProductsToLookbook(
    @Param('id', ParseIntPipe) lookbookId: number,
    @Body('productIds') productIds: number[],
  ) {
    return this.lookbooksService.addProductsToLookbook(lookbookId, productIds);
  }

  // =========================================
  // ✅ REMOVE PRODUCT
  // =========================================
  @Roles('ADMIN')
  @Delete(':id/items/:productId')
  async removeProductFromLookbook(
    @Param('id', ParseIntPipe) lookbookId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.lookbooksService.removeProductFromLookbook(lookbookId, productId);
  }
}
