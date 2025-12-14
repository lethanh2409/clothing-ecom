// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { categories } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin: lấy tất cả category (kèm children nếu bạn đã khai báo relation trong schema)
  async getAllCategories(): Promise<categories[]> {
    return this.prisma.categories.findMany({
      orderBy: { category_id: 'asc' },
      // Nếu trong prisma/schema.prisma bạn đặt tên relation là `children`
      include: { children: true },
    });
  }

  // FE: chỉ lấy category đang active
  async getCategoriesByStatus(): Promise<categories[]> {
    return this.prisma.categories.findMany({
      where: { status: true },
      orderBy: { category_id: 'asc' },
      include: { children: true },
    });
  }

  // Lấy tất cả category cha (parent_id IS NULL)
  async getParentCategories(): Promise<categories[]> {
    return this.prisma.categories.findMany({
      where: { parent_id: null },
      orderBy: { category_id: 'asc' },
      include: { children: true },
    });
  }

  // Lấy tất cả category con theo parent_id
  async getSubCategories(parentId: number): Promise<categories[]> {
    return this.prisma.categories.findMany({
      where: { parent_id: parentId },
      orderBy: { category_id: 'asc' },
      include: { children: true },
    });
  }

  async getCategoryById(id: number): Promise<categories> {
    const category = await this.prisma.categories.findUnique({
      where: { category_id: id },
      // Nếu muốn kèm quan hệ:
      // include: { parent: true, children: true, products: true },
    });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  // --- ADMIN CRUD ---
  async create(dto: CreateCategoryDto): Promise<categories> {
    return this.prisma.categories.create({
      data: {
        category_name: dto.category_name,
        slug:
          dto.slug ??
          slugify(dto.category_name, {
            lower: true,
            strict: true, // bỏ ký tự đặc biệt
            locale: 'vi', // hỗ trợ tiếng Việt
          }),
        description: dto.description ?? '',
        parent_id: dto.parent_id ?? null,
        status: dto.status ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<categories> {
    const existed = await this.prisma.categories.findUnique({ where: { category_id: id } });
    if (!existed) throw new NotFoundException('Category not found');

    return this.prisma.categories.update({
      where: { category_id: id },
      data: {
        category_name: dto.category_name ?? existed.category_name,
        slug: dto.slug ?? existed.slug,
        description: dto.description ?? existed.description,
        parent_id: dto.parent_id ?? existed.parent_id,
        status: typeof dto.status === 'boolean' ? dto.status : existed.status,
      },
    });
  }

  async softDelete(id: number): Promise<categories> {
    const existed = await this.prisma.categories.findUnique({ where: { category_id: id } });
    if (!existed) throw new NotFoundException('Category not found');

    return this.prisma.categories.update({
      where: { category_id: id },
      data: { status: false },
    });
  }
}
