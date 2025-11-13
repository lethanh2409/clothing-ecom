import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateLookbookDto } from './dtos/update-lookbook.dto';
import slugify from 'slugify';
import type { Express } from 'express';
import { CreateLookbookDto } from './dtos/create-lookbook.dto';

@Injectable()
export class LookbooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // =========================================
  // ✅ CREATE LOOKBOOK
  // =========================================
  async create(dto: CreateLookbookDto, imageFile?: Express.Multer.File) {
    let image = dto.image ?? null;

    if (imageFile) {
      const res = await this.cloudinary.uploadBuffer(
        imageFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/lookbook`,
      );
      image = res.secure_url;
    }

    const slugBase = slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
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
  // ✅ ADD MULTIPLE PRODUCTS (UPDATED)
  // =========================================
  async addProductsToLookbook(lookbookId: number, productIds: number[]) {
    // 1️⃣ Kiểm tra lookbook tồn tại
    const lb = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
    });
    if (!lb) throw new NotFoundException('Không tìm thấy lookbook');

    // 2️⃣ Validate mảng
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('productIds phải là mảng có ít nhất 1 phần tử');
    }

    // 3️⃣ Kiểm tra sản phẩm có tồn tại không
    const existingProducts = await this.prisma.products.findMany({
      where: { product_id: { in: productIds } },
      select: { product_id: true },
    });
    const existingIds = existingProducts.map((p) => p.product_id);
    const invalidIds = productIds.filter((id) => !existingIds.includes(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(`Không tìm thấy sản phẩm: ${invalidIds.join(', ')}`);
    }

    // 4️⃣ Tính vị trí (append vào cuối)
    const lastPos = await this.prisma.lookbook_items.findFirst({
      where: { lookbook_id: lookbookId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    const startPos = (lastPos?.position ?? 0) + 1;

    const data = productIds.map((pid, idx) => ({
      lookbook_id: lookbookId,
      product_id: pid,
      position: startPos + idx,
    }));

    // 5️⃣ Tạo items
    await this.prisma.lookbook_items.createMany({
      data,
      skipDuplicates: true,
    });

    // 6️⃣ Lấy lại lookbook kèm items để trả về
    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
      include: {
        lookbook_items: {
          select: {
            item_id: true,
            product_id: true,
            position: true,
            note: true,
          },
        },
      },
    });

    // 7️⃣ Response
    return {
      success: true,
      message: `Đã thêm ${productIds.length} sản phẩm vào lookbook`,
      lookbook,
    };
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
