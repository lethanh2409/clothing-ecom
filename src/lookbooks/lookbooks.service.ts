// src/lookbooks/lookbooks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class LookbooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // CREATE lookbook (kèm ảnh tuỳ chọn)
  async create(dto: any, imageFile?: Express.Multer.File) {
    let image = dto.image ?? null;
    if (imageFile) {
      const res = await this.cloudinary.uploadBuffer(
        imageFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/lookbook`,
      );
      image = res.secure_url;
    }

    return this.prisma.lookbooks.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description ?? null,
        image,
      },
    });
  }

  // UPDATE lookbook (đổi ảnh nếu có file mới)
  async update(id: number, dto: any, imageFile?: Express.Multer.File) {
    const existed = await this.prisma.lookbooks.findUnique({ where: { lookbook_id: id } });
    if (!existed) throw new NotFoundException(`Lookbook with id ${id} not found`);

    let image = dto.image ?? existed.image;
    if (imageFile) {
      const res = await this.cloudinary.uploadBuffer(
        imageFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/lookbook`,
      );
      image = res.secure_url;
      // (tuỳ chọn) nếu bạn lưu public_id, có thể xoá ảnh cũ ở đây
    }

    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: {
        title: dto.title ?? existed.title,
        slug: dto.slug ?? existed.slug,
        description: dto.description ?? existed.description,
        image,
      },
    });
  }

  // Lấy tất cả lookbook (kèm items -> variant -> product)
  async getAll() {
    return this.prisma.lookbooks.findMany({
      orderBy: { lookbook_id: 'desc' },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            product_variants: {
              include: {
                products: true,
                variant_assets: true,
              },
            },
          },
        },
      },
    });
  }

  // Lấy 1 lookbook theo id
  async getOne(id: number) {
    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: id },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            product_variants: {
              include: {
                products: true,
                variant_assets: true,
              },
            },
          },
        },
      },
    });
    if (!lookbook) throw new NotFoundException(`Lookbook with id ${id} not found`);
    return lookbook;
  }
}
