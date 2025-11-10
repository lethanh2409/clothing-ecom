import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateLookbookDto } from './dtos/update-lookbook.dto';
import slugify from 'slugify';
import type { Express } from 'express';

@Injectable()
export class LookbooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // =========================================
  // ✅ CREATE LOOKBOOK
  // =========================================
  async create(dto: any, imageFile?: Express.Multer.File) {
    let image = dto.image ?? null;

    if (imageFile) {
      const res = await this.cloudinary.uploadBuffer(
        imageFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/lookbook`,
      );
      image = res.secure_url;
    }

    const slugBase = dto.slug || slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
    const existed = await this.prisma.lookbooks.findFirst({ where: { slug: slugBase } });
    const finalSlug = existed ? `${slugBase}-${Date.now()}` : slugBase;

    return this.prisma.lookbooks.create({
      data: {
        title: dto.title,
        slug: finalSlug,
        description: dto.description ?? '',
        image,
        status: 'ACTIVE',
      },
    });
  }

  // =========================================
  // ✅ UPDATE LOOKBOOK
  // =========================================
  async update(id: number, dto: UpdateLookbookDto, imageFile?: Express.Multer.File) {
    const existed = await this.prisma.lookbooks.findUnique({ where: { lookbook_id: id } });
    if (!existed) throw new NotFoundException(`Lookbook with id ${id} not found`);

    let image = dto.image ?? existed.image;
    if (imageFile) {
      const res = await this.cloudinary.uploadBuffer(
        imageFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/lookbook`,
      );
      image = res.secure_url;
    }

    let finalSlug = existed.slug;
    if (dto.title && dto.title !== existed.title) {
      const slugBase = slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
      const existedSlug = await this.prisma.lookbooks.findFirst({ where: { slug: slugBase } });
      finalSlug = existedSlug ? `${slugBase}-${Date.now()}` : slugBase;
    }

    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: {
        title: dto.title ?? existed.title,
        slug: finalSlug,
        description: dto.description ?? existed.description,
        image,
        status: dto.status ?? existed.status,
      },
    });
  }

  // =========================================
  // ✅ SOFT DELETE
  // =========================================
  async softDelete(id: number) {
    const lb = await this.prisma.lookbooks.findUnique({ where: { lookbook_id: id } });
    if (!lb) throw new NotFoundException(`Lookbook with id ${id} not found`);
    if (lb.status === 'INACTIVE') throw new BadRequestException('Lookbook đã bị vô hiệu hóa');

    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: { status: 'INACTIVE' },
    });
  }

  // =========================================
  // ✅ GET ALL (ADMIN)
  // =========================================
  async getAll() {
    return this.prisma.lookbooks.findMany({
      orderBy: { lookbook_id: 'desc' },
      include: {
        lookbook_items: {
          include: {
            products: true,
          },
        },
      },
    });
  }

  // =========================================
  // ✅ GET ACTIVE FOR CUSTOMER
  // =========================================
  async getActiveForCustomer() {
    const lookbooks = await this.prisma.lookbooks.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { lookbook_id: 'desc' },
      include: {
        lookbook_items: {
          include: {
            products: {
              include: {
                product_variants: true,
              },
            },
          },
        },
      },
    });

    return lookbooks.map((lb) => ({
      ...lb,
      lookbook_items: lb.lookbook_items.filter(
        (it) => it.products && it.products.status === 'ACTIVE',
      ),
    }));
  }

  // =========================================
  // ✅ GET ITEMS (ADMIN)
  // =========================================
  async getItemsAdmin(lookbookId: number) {
    const lb = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            products: {
              include: {
                product_variants: {
                  include: { variant_assets: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lb) throw new NotFoundException('Lookbook not found');
    return lb.lookbook_items;
  }

  // =========================================
  // ✅ GET ITEMS (CUSTOMER) - ĐÃ FIX
  // =========================================
  async getItemsForCustomer(lookbookId: number) {
    const lb = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            products: {
              include: {
                product_variants: {
                  include: { variant_assets: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lb) throw new NotFoundException('Lookbook not found');

    // ✅ FIX: Đổi từ = (gán) sang === (so sánh)
    const items = lb.lookbook_items
      .filter((it) => it.products && it.products.status === 'ACTIVE')
      .map((it) => {
        const product = it.products;
        product.product_variants = (product.product_variants || []).filter(
          (v) => v.status === true && (v.quantity ?? 0) > 0, // ✅ Đã fix: === thay vì =
        );
        return { ...it, products: product };
      });

    return items;
  }

  // =========================================
  // ✅ ADD MULTIPLE PRODUCTS
  // =========================================
  async addProductsToLookbook(lookbookId: number, productIds: number[]) {
    const lb = await this.prisma.lookbooks.findUnique({ where: { lookbook_id: lookbookId } });
    if (!lb) throw new NotFoundException('Lookbook not found');

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('productIds phải là mảng có ít nhất 1 phần tử');
    }

    const data = productIds.map((pid, idx) => ({
      lookbook_id: lookbookId,
      product_id: pid,
      position: idx + 1,
    }));

    await this.prisma.lookbook_items.createMany({
      data,
      skipDuplicates: true,
    });

    return { success: true, added: productIds.length };
  }

  // =========================================
  // ✅ REMOVE PRODUCT
  // =========================================
  async removeProductFromLookbook(lookbookId: number, productId: number) {
    await this.prisma.lookbook_items.delete({
      where: { lookbook_id_product_id: { lookbook_id: lookbookId, product_id: productId } },
    });
    return { success: true, message: 'Removed from lookbook' };
  }

  // =========================================
  // ✅ GET ONE LOOKBOOK
  // =========================================
  async getOne(id: number) {
    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: id },
      include: {
        lookbook_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!lookbook) throw new NotFoundException(`Lookbook with id ${id} not found`);
    return lookbook;
  }
}
