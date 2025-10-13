// src/brands/brands.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, brands } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin: lấy tất cả brands
  async getAllBrands(): Promise<brands[]> {
    return this.prisma.brands.findMany({
      orderBy: { brand_id: 'asc' },
    });
  }

  // FE: chỉ lấy brands đang active
  async getBrandsByStatus(): Promise<brands[]> {
    return this.prisma.brands.findMany({
      where: { status: true },
      orderBy: { brand_id: 'asc' },
    });
  }

  // --- ADMIN CRUD ---
  async create(dto: CreateBrandDto): Promise<brands> {
    try {
      return await this.prisma.brands.create({
        data: {
          brand_name: dto.brand_name,
          slug: dto.slug,
          description: dto.description,
          status: dto.status ?? true, // default active
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

  async update(id: number, dto: UpdateBrandDto): Promise<brands> {
    const existed = await this.prisma.brands.findUnique({ where: { brand_id: id } });
    if (!existed) throw new NotFoundException(`Brand #${id} not found`);

    return this.prisma.brands.update({
      where: { brand_id: id },
      data: {
        brand_name: dto.brand_name ?? existed.brand_name,
        slug: dto.slug ?? existed.slug,
        description: dto.description ?? existed.description,
        status: typeof dto.status === 'boolean' ? dto.status : existed.status,
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
