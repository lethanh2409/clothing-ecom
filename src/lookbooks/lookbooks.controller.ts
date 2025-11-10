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
  constructor(private readonly service: LookbooksService) {}

  // =========================
  // 👥 CUSTOMER: chỉ xem lookbook ACTIVE
  // =========================
  @Public()
  @Get('active')
  getActive() {
    return this.service.getActive();
  }

  // =========================
  // 🔍 GET ONE (ai cũng xem được)
  // =========================
  @Public()
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  // =========================
  // 🛠 ADMIN: GET ALL
  // =========================
  @Get()
  @Roles('ADMIN')
  getAll() {
    return this.service.getAll();
  }

  // =========================
  // 🆕 CREATE LOOKBOOK
  // =========================
  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreateLookbookDto, @UploadedFile() image?: Express.Multer.File) {
    return this.service.create(dto, image);
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
    return this.service.update(id, dto, image);
  }

  // =========================
  // 🗑️ SOFT DELETE LOOKBOOK
  // =========================
  @Delete(':id')
  @Roles('ADMIN')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }

  // ==========================
  // LOOKBOOK ITEMS
  // ==========================
  // @Roles('ADMIN')
  // @Get(':id/items')
  // getItems(@Param('id', ParseIntPipe) id: number) {
  //   return this.service.getItems(id);
  // }

  // @Roles('ADMIN')
  // @Post(':id/items')
  // addItem(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() body: { variant_id: number; note?: string; position?: number },
  // ) {
  //   return this.service.addItem(id, body.variant_id, body.note, body.position);
  // }

  // @Roles('ADMIN')
  // @Delete(':id/items/:variantId')
  // removeItem(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Param('variantId', ParseIntPipe) variantId: number,
  // ) {
  //   return this.service.removeItem(id, variantId);
  // }

  // @Roles('ADMIN')
  // @Patch(':id/status')
  // toggleStatus(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() body: { status: 'ACTIVE' | 'INACTIVE' },
  // ) {
  //   return this.service.toggleStatus(id, body.status);
  // }
}
