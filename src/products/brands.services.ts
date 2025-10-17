// src/brands/brands.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, brands } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import type { Express } from 'express';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Admin: lấy tất cả brands (bao gồm logo_url)
  async getAllBrands(): Promise<brands[]> {
    return this.prisma.brands.findMany({
      orderBy: { brand_id: 'asc' },
    });
  }

  // FE: chỉ lấy brands đang active (bao gồm logo_url)
  async getBrandsByStatus(): Promise<brands[]> {
    return this.prisma.brands.findMany({
      where: { status: true },
      orderBy: { brand_id: 'asc' },
    });
  }

  async getBrandById(id: number): Promise<brands> {
    const brand = await this.prisma.brands.findUnique({
      where: { brand_id: id },
    });
    if (!brand) throw new NotFoundException(`Brand #${id} not found`);
    return brand;
  }

  // --- ADMIN CRUD ---
  async create(dto: CreateBrandDto, logoFile?: Express.Multer.File): Promise<brands> {
    try {
      let logo_url = dto.logo_url ?? null;

      // Nếu có file ảnh, upload Cloudinary -> lấy secure_url
      if (logoFile) {
        const res = await this.cloudinary.uploadBuffer(
          logoFile,
          `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/brand`,
        );
        logo_url = res.secure_url;
      }

      return await this.prisma.brands.create({
        data: {
          brand_name: dto.brand_name,
          slug: dto.slug,
          description: dto.description,
          status: dto.status ?? true,
          logo_url,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[]).join(', ')
          : 'unique field';
        throw new ConflictException(`Brand with ${target} already exists`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateBrandDto, logoFile?: Express.Multer.File): Promise<brands> {
    const existed = await this.prisma.brands.findUnique({ where: { brand_id: id } });
    if (!existed) throw new NotFoundException(`Brand #${id} not found`);

    let logo_url = dto.logo_url ?? existed.logo_url;

    if (logoFile) {
      const res = await this.cloudinary.uploadBuffer(
        logoFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/brand`,
      );
      logo_url = res.secure_url;
      // Nếu bạn có lưu public_id, có thể gọi this.cloudinary.delete(oldPublicId) ở đây.
    }

    return this.prisma.brands.update({
      where: { brand_id: id },
      data: {
        brand_name: dto.brand_name ?? existed.brand_name,
        slug: dto.slug ?? existed.slug,
        description: dto.description ?? existed.description,
        status: typeof dto.status === 'boolean' ? dto.status : existed.status,
        logo_url,
      },
    });
  }

  async softDelete(id: number): Promise<brands> {
    const existed = await this.prisma.brands.findUnique({ where: { brand_id: id } });
    if (!existed) throw new NotFoundException(`Brand #${id} not found`);

    return this.prisma.brands.update({
      where: { brand_id: id },
      data: { status: false },
    });
  }
}
