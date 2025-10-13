// src/lookbooks/lookbooks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LookbooksService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả lookbook (kèm items -> variant -> product)
  async getAll() {
    return this.prisma.lookbooks.findMany({
      orderBy: { lookbook_id: 'desc' }, // dùng lookbook_id vì thường không có created_at
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            product_variants: {
              include: {
                products: true, // thông tin product
                variant_assets: true, // ảnh variant (nếu cần)
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

    if (!lookbook) {
      throw new NotFoundException(`Lookbook with id ${id} not found`);
    }

    return lookbook;
  }
}
