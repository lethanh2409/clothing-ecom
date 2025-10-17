// src/lookbooks/lookbooks.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  UseInterceptors,
  UploadedFile,
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

  @Public()
  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Public()
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image')) // field name: image
  @Roles('ADMIN')
  create(@Body() dto: CreateLookbookDto, @UploadedFile() image?: Express.Multer.File) {
    return this.service.create(dto, image);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLookbookDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, image);
  }
}
