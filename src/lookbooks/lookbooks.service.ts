import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateLookbookDto } from './dtos/update-lookbook.dto';
import slugify from 'slugify';
import type { Express } from 'express';
import { CreateLookbookDto } from './dtos/create-lookbook.dto';
import { product_variants, products } from '@prisma/client';

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

    // 🔹 Kiểm tra trùng title
    const existedTitle = await this.prisma.lookbooks.findUnique({
      where: { title: dto.title },
    });
    if (existedTitle)
      throw new BadRequestException(`Lookbook với tiêu đề "${dto.title}" đã tồn tại`);

    // 🔹 Sinh slug
    const slugBase = slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
    const existedSlug = await this.prisma.lookbooks.findFirst({ where: { slug: slugBase } });
    const finalSlug = existedSlug ? `${slugBase}-${Date.now()}` : slugBase;

    // 🔹 Tạo và include items (để đồng bộ format)
    return this.prisma.lookbooks.create({
      data: {
        title: dto.title,
        slug: finalSlug,
        description: dto.description ?? '',
        image,
        status: 'ACTIVE',
      },
      include: {
        lookbook_items: {
          include: {
            products: {
              include: {
                product_variants: {
                  take: 1,
                  include: { variant_assets: true },
                },
              },
            },
          },
        },
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
      // 🔹 Kiểm tra trùng title
      const existedTitle = await this.prisma.lookbooks.findUnique({
        where: { title: dto.title },
      });
      if (existedTitle)
        throw new BadRequestException(`Lookbook với tiêu đề "${dto.title}" đã tồn tại`);

      // 🔹 Tạo slug mới
      const slugBase = slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
      const existedSlug = await this.prisma.lookbooks.findFirst({ where: { slug: slugBase } });
      finalSlug = existedSlug ? `${slugBase}-${Date.now()}` : slugBase;
    }

    // 🔹 Cập nhật và include lại items để frontend có thể render ngay
    return this.prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: {
        title: dto.title ?? existed.title,
        slug: finalSlug,
        description: dto.description ?? existed.description,
        image,
        status: dto.status ?? existed.status,
      },
      include: {
        lookbook_items: {
          include: {
            products: {
              include: {
                product_variants: {
                  take: 1,
                  include: { variant_assets: true },
                },
              },
            },
          },
        },
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
  // ✅ GET ALL (ADMIN) - CÓ ẢNH
  // =========================================
  async getAll() {
    const lookbooks = await this.prisma.lookbooks.findMany({
      orderBy: { lookbook_id: 'desc' },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            products: {
              select: {
                product_id: true,
                product_name: true,
                slug: true,
                status: true,
                product_variants: {
                  take: 1,
                  select: {
                    variant_id: true,
                    base_price: true,
                    variant_assets: {
                      where: { is_primary: true },
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return lookbooks.map((lb) => ({
      ...lb,
      lookbook_items: lb.lookbook_items.map((item) => {
        const product = item.products;
        const variant = product?.product_variants?.[0];
        const image = variant?.variant_assets?.[0]?.url ?? null;

        return {
          item_id: item.item_id,
          product_id: product?.product_id,
          position: item.position,
          product_name: product?.product_name,
          slug: product?.slug,
          price: variant ? Number(variant.base_price) : null,
          image,
        };
      }),
    }));
  }

  // =========================================
  // ✅ GET ACTIVE FOR CUSTOMER - CÓ ẢNH
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
                product_variants: {
                  where: {
                    status: true,
                    quantity: { gt: 0 },
                  },
                  take: 1, // Chỉ lấy variant đầu tiên
                  include: {
                    variant_assets: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return lookbooks.map((lb) => ({
      ...lb,
      lookbook_items: lb.lookbook_items
        .filter((it) => it.products && it.products.status === 'ACTIVE')
        .map((item) => ({
          ...item,
          products: item.products
            ? {
                ...item.products,
              }
            : null,
        })),
    }));
  }

  // ======================================================
  // 🧩 HÀM DÙNG CHUNG - FORMAT LOOKBOOK ITEMS
  // ======================================================
  private formatLookbookItems(rawItems: any[]) {
    return rawItems
      .map((item) => {
        const product = item.products;
        if (!product) return null;

        const variant = product.product_variants?.[0];
        const image = variant?.variant_assets?.[0]?.url ?? null;

        let price: number | null = null;
        const bp = variant?.base_price;
        if (bp) {
          if (typeof bp === 'number') price = bp;
          else if (bp.d?.[0]) price = Number(bp.d[0]);
        }

        return {
          item_id: item.item_id,
          lookbook_id: item.lookbook_id,
          product_id: product.product_id,
          product_name: product.product_name,
          slug: product.slug,
          price,
          image,
          status: product.status,
          position: item.position,
          note: item.note ?? null,
        };
      })
      .filter(Boolean);
  }

  // ======================================================
  // ✅ GET ITEMS (ADMIN)
  // ======================================================
  async getItemsAdmin(lookbookId: number) {
    const lb = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            products: {
              select: {
                product_id: true,
                product_name: true,
                slug: true,
                status: true,
                product_variants: {
                  take: 1,
                  select: {
                    base_price: true,
                    variant_assets: {
                      where: { is_primary: true },
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lb) throw new NotFoundException('Lookbook not found');

    const items = this.formatLookbookItems(lb.lookbook_items);

    if (!items || items.length === 0) {
      return {
        success: true,
        message: 'Lookbook hiện chưa có sản phẩm.',
        items: [],
      };
    }

    return {
      success: true,
      message: `Found ${items.length} product(s) in lookbook.`,
      items,
    };
  }

  // ======================================================
  // ✅ GET ITEMS (CUSTOMER)
  // ======================================================
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
                  take: 1,
                  include: { variant_assets: true },
                },
              },
            },
          },
        },
      },
    });
    if (!lb) throw new NotFoundException('Lookbook not found');
    const items = lb.lookbook_items.filter((it) => it.products?.status === 'ACTIVE');

    return this.formatLookbookItems(items);
  }

  // ======================================================
  // ✅ ADD MULTIPLE PRODUCTS
  // ======================================================
  async addProductsToLookbook(lookbookId: number, productIds: number[]) {
    const lb = await this.prisma.lookbooks.findUnique({ where: { lookbook_id: lookbookId } });
    if (!lb) throw new NotFoundException('Không tìm thấy lookbook');

    if (!Array.isArray(productIds) || productIds.length === 0)
      throw new BadRequestException('productIds phải là mảng có ít nhất 1 phần tử');

    const existingProducts = await this.prisma.products.findMany({
      where: { product_id: { in: productIds } },
      select: { product_id: true },
    });
    const existingIds = existingProducts.map((p) => p.product_id);
    const invalidIds = productIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0)
      throw new BadRequestException(`Không tìm thấy sản phẩm: ${invalidIds.join(', ')}`);

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

    await this.prisma.lookbook_items.createMany({ data, skipDuplicates: true });

    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: lookbookId },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            products: {
              select: {
                product_id: true,
                product_name: true,
                slug: true,
                status: true,
                product_variants: {
                  take: 1,
                  select: {
                    base_price: true,
                    variant_assets: {
                      where: { is_primary: true },
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lookbook) throw new NotFoundException('Không tìm thấy lookbook');

    return {
      message: 'Thêm sản phẩm vào lookbook thành công',
      data: {
        ...lookbook,
        lookbook_items: this.formatLookbookItems(lookbook.lookbook_items),
      },
    };
  }

  // ======================================================
  // ✅ REMOVE PRODUCT
  // ======================================================
  async removeProductFromLookbook(lookbookId: number, productId: number) {
    await this.prisma.lookbook_items.delete({
      where: { lookbook_id_product_id: { lookbook_id: lookbookId, product_id: productId } },
    });
    return { success: true, message: 'Removed from lookbook' };
  }

  // ======================================================
  // ✅ GET ONE LOOKBOOK
  // ======================================================
  async getOne(id: number) {
    const lookbook = await this.prisma.lookbooks.findUnique({
      where: { lookbook_id: id },
      include: {
        lookbook_items: {
          orderBy: { position: 'asc' },
          include: {
            products: {
              select: {
                product_id: true,
                product_name: true,
                slug: true,
                status: true,
                product_variants: {
                  take: 1,
                  select: {
                    base_price: true,
                    variant_assets: {
                      where: { is_primary: true },
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!lookbook) throw new NotFoundException(`Lookbook with id ${id} not found`);
    return { ...lookbook, lookbook_items: this.formatLookbookItems(lookbook.lookbook_items) };
  }
}
