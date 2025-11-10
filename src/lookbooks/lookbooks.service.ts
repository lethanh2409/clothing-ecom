import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import slugify from 'slugify';
import { UpdateLookbookDto } from './dtos/update-lookbook.dto';

@Injectable()
export class LookbooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // =========================
  // ✅ CREATE LOOKBOOK
  // =========================
  // CREATE lookbook (slug auto-gen nếu không có)
  async create(dto: any, imageFile?: Express.Multer.File) {
    let image = dto.image ?? null;
    if (imageFile) {
      const res = await this.cloudinary.uploadBuffer(
        imageFile,
        `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/lookbook`,
      );
      image = res.secure_url;
    }

    // ✅ Tự tạo slug nếu người dùng không gửi
    const slug =
      dto.slug ||
      slugify(dto.title, {
        lower: true,
        strict: true,
        locale: 'vi',
      });

    // (tuỳ chọn) thêm hậu tố nếu slug trùng
    const existed = await this.prisma.lookbooks.findFirst({ where: { slug } });
    const finalSlug = existed ? `${slug}-${Date.now()}` : slug;

    return this.prisma.lookbooks.create({
      data: {
        title: dto.title,
        slug: finalSlug,
        description: dto.description ?? null,
        image,
        status: 'ACTIVE', // mặc định
      },
    });
  }

  // UPDATE (tự gen slug nếu đổi title mà không truyền slug)
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

    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: {
        title: dto.title ?? existed.title,
        description: dto.description ?? existed.description,
        image: image,
        status: dto.status ?? existed.status,
      },
    });
  }

  // =========================
  // ✅ SOFT DELETE LOOKBOOK
  // =========================
  async softDelete(id: number) {
    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: id },
    });
    if (!lookbook) throw new NotFoundException(`Lookbook with id ${id} not found`);

    if (lookbook.status === 'INACTIVE') {
      throw new BadRequestException('Lookbook đã bị vô hiệu hóa trước đó');
    }

    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: { status: 'INACTIVE' },
    });
  }

  // =========================
  // ✅ GET ALL (ADMIN)
  // =========================
  async getAll() {
    return this.prisma.lookbooks.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // 🔹 CUSTOMER: Lấy lookbook active
  async getActive() {
    const lookbooks = await this.prisma.lookbooks.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { created_at: 'desc' },
      include: {
        lookbook_items: {
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

    // 🔹 Lọc sản phẩm có status = ACTIVE
    return lookbooks.map((lb) => ({
      ...lb,
      lookbook_items: lb.lookbook_items.filter(
        (item) => item.product_variants?.products?.status === 'ACTIVE',
      ),
    }));
  }

  // 🔹 ADMIN: Lấy danh sách sản phẩm trong lookbook
  async getItems(lookbookId: number) {
    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
      include: {
        lookbook_items: {
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
    if (!lookbook) throw new NotFoundException('Lookbook not found');
    return lookbook.lookbook_items;
  }

  // 🔹 ADMIN: Thêm sản phẩm vào lookbook
  async addItem(lookbookId: number, variantId: number, note?: string, position?: number) {
    const existed = await this.prisma.lookbooks.findUnique({ where: { lookbook_id: lookbookId } });
    if (!existed) throw new NotFoundException('Lookbook not found');

    return this.prisma.lookbook_items.create({
      data: {
        lookbook_id: lookbookId,
        variant_id: variantId,
        note,
        position: position ?? 0,
      },
    });
  }

  // 🔹 ADMIN: Xoá sản phẩm khỏi lookbook
  async removeItem(lookbookId: number, variantId: number) {
    return this.prisma.lookbook_items.delete({
      where: { lookbook_id_variant_id: { lookbook_id: lookbookId, variant_id: variantId } },
    });
  }

  // 🔹 ADMIN: Soft delete / toggle status
  async toggleStatus(id: number, status: 'ACTIVE' | 'INACTIVE') {
    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: { status },
    });
  }

  // =========================
  // ✅ GET ONE
  // =========================
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
