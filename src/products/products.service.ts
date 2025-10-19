import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, variant_assets } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

// ===== Types kết quả =====
type VariantWithAssets = Prisma.product_variantsGetPayload<{
  include: { variant_assets: true; sizes: true };
}>;
type ProductWithRelations = Prisma.productsGetPayload<{
  include: {
    product_variants: { include: { variant_assets: true; sizes: true } };
    brands: true;
    categories: true;
  };
}>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ================= Helpers =================
  private pickPrimaryImage(variant?: VariantWithAssets | null): string | null {
    const img = variant?.variant_assets?.find((a) => a.is_primary);
    return img?.url ?? null;
  }
  private readColor(variant?: { attribute: Prisma.JsonValue | null } | null): string | null {
    const j = variant?.attribute ?? null;
    if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
    const obj = j as Record<string, unknown>;
    return typeof obj.color === 'string' ? obj.color : null;
  }
  private async generateUniqueSku(
    tx: Prisma.TransactionClient,
    product_id: number,
    product_name: string,
    size_id: number,
    color: string,
  ) {
    const norm = (s: string) =>
      s
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .toUpperCase();
    const base = `${norm(product_name).slice(0, 10)}-${size_id}-${norm(color).slice(0, 6)}`;
    let candidate = base,
      i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const hit = await tx.product_variants.findFirst({ where: { sku: candidate } });
      if (!hit) return candidate;
      candidate = `${base}-${++i}`;
    }
  }

  // trong ProductsService
  private ean13Checksum(digits12: string): number {
    const ds = digits12.split('').map((n) => Number(n));
    const sum = ds.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
    const mod = sum % 10;
    return mod === 0 ? 0 : 10 - mod;
  }

  private async generateBarcode(
    tx: Prisma.TransactionClient,
    product_id: number,
    size_id: number,
    color: string,
  ): Promise<string> {
    // tạo 12 số pseudo-unique từ ids + hash màu
    const colorCode = Math.abs(this.simpleHash(color)) % 1000; // 3 số
    const base =
      `${(product_id % 1000).toString().padStart(3, '0')}${(size_id % 100).toString().padStart(2, '0')}${Date.now() % 1_000_000}`
        .padStart(9, '0')
        .slice(-9);
    let body = `200${base.slice(0, 6)}${colorCode.toString().padStart(3, '0')}`; // 12 số bắt đầu bằng 200
    let ean = body + this.ean13Checksum(body);

    // đảm bảo chưa đụng (nếu bạn có unique trên barcode thì càng chuẩn)
    let i = 0;
    while (await tx.product_variants.findFirst({ where: { barcode: ean } })) {
      const bump = (++i % 1000).toString().padStart(3, '0');
      body = body.slice(0, 9) + bump;
      ean = body + this.ean13Checksum(body);
    }
    return ean;
  }

  // hash nhanh cho màu
  private simpleHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  // ================= Queries (rút gọn phần chính) =================
  async getAllProductsWithFirstVariant() {
    const items = await this.prisma.products.findMany({
      include: {
        product_variants: {
          include: { variant_assets: true, sizes: true },
          orderBy: { variant_id: 'asc' },
        },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });
    return (items as ProductWithRelations[]).map((p) => {
      const v = p.product_variants?.[0] ?? null;
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
        category: p.categories
          ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
          : null,
        sku: v?.sku ?? null,
        price: v?.base_price ? Number(v.base_price) : null,
        size: v?.sizes?.size_label ?? null,
        color: this.readColor(v),
        image: this.pickPrimaryImage(v),
        status: p.status,
      };
    });
  }

  async getProductsByStatus(status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' = 'ACTIVE') {
    const items = await this.prisma.products.findMany({
      where: { status },
      include: {
        product_variants: {
          include: { variant_assets: true, sizes: true },
          orderBy: { variant_id: 'asc' },
        },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });
    return (items as ProductWithRelations[]).map((p) => {
      const v = p.product_variants?.[0] ?? null;
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
        category: p.categories
          ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
          : null,
        sku: v?.sku ?? null,
        price: v?.base_price ? Number(v.base_price) : null,
        size: v?.sizes?.size_label ?? null,
        color: this.readColor(v),
        image: this.pickPrimaryImage(v),
        status: p.status,
      };
    });
  }

  async getProductById(productId: number) {
    const product = await this.prisma.products.findUnique({
      where: { product_id: productId },
      include: {
        product_variants: { include: { variant_assets: true, sizes: true } },
        brands: true,
        categories: true,
      },
    });
    if (!product) throw new NotFoundException(`Product ${productId} không tồn tại`);
    const p = product as ProductWithRelations;
    return {
      product_id: p.product_id,
      product_name: p.product_name,
      brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
      category: p.categories
        ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
        : null,
      status: p.status,
      variants: p.product_variants.map((v) => ({
        variant_id: v.variant_id,
        sku: v.sku,
        price: v.base_price ? Number(v.base_price) : null,
        size: v.sizes?.size_label ?? null,
        color: this.readColor(v),
        image: this.pickPrimaryImage(v),
      })),
    };
  }

  // ================= CREATE (no assets) =================
  async createProductWithVariants(input: CreateProductDto) {
    if (!Array.isArray(input.variants) || input.variants.length === 0) {
      throw new BadRequestException('`variants` must be a non-empty array');
    }

    // (tuỳ chọn) check sớm để trả 409 rõ ràng hơn
    if (input.slug) {
      const existedSlug = await this.prisma.products.findUnique({ where: { slug: input.slug } });
      if (existedSlug) {
        throw new ConflictException('Slug đã tồn tại, vui lòng chọn slug khác');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.products.create({
          data: {
            brand_id: input.brand_id ?? null,
            category_id: input.category_id ?? null,
            product_name: String(input.product_name),
            slug: input.slug ?? null,
            description: input.description ?? null,
            status: (input.status as any) ?? 'ACTIVE',
          },
        });

        // de-dup (size,color)
        const seen = new Set<string>();
        for (const v of input.variants) {
          const key = `${Number(v.size_id)}::${String(v.color).trim().toLowerCase()}`;
          if (seen.has(key)) throw new ConflictException(`Biến thể bị trùng (size,color): ${key}`);
          seen.add(key);
        }

        // tạo variants (không ảnh)
        for (const v of input.variants) {
          const color = String(v.color).trim();
          const sku =
            v.sku ??
            (await this.generateUniqueSku(
              tx,
              product.product_id,
              product.product_name,
              Number(v.size_id),
              color,
            ));
          const barcode =
            v.barcode ??
            (await this.generateBarcode(tx, product.product_id, Number(v.size_id), color));

          await tx.product_variants.create({
            data: {
              product_id: product.product_id,
              size_id: Number(v.size_id),
              sku,
              barcode, // 👈 auto barcode
              cost_price: v.cost_price != null ? new Prisma.Decimal(Number(v.cost_price)) : null,
              base_price: v.base_price != null ? new Prisma.Decimal(Number(v.base_price)) : null,
              quantity: v.quantity != null ? Number(v.quantity) : 0,
              status: true,
              attribute: { color } as Prisma.InputJsonValue,
            },
          });
        }

        const raw = await tx.products.findUnique({
          where: { product_id: product.product_id },
          include: {
            product_variants: {
              include: { variant_assets: true, sizes: true },
              orderBy: { variant_id: 'asc' },
            },
            brands: true,
            categories: true,
          },
        });

        // chuẩn hoá Decimal -> number
        return {
          product_id: raw!.product_id,
          product_name: raw!.product_name,
          brand: raw!.brands
            ? { brand_id: raw!.brands.brand_id, brand_name: raw!.brands.brand_name }
            : null,
          category: raw!.categories
            ? {
                category_id: raw!.categories.category_id,
                category_name: raw!.categories.category_name,
              }
            : null,
          status: raw!.status,
          variants: raw!.product_variants.map((v) => ({
            variant_id: v.variant_id,
            sku: v.sku,
            price: v.base_price != null ? Number(v.base_price) : null,
            size: v.sizes?.size_label ?? null,
            color: this.readColor(v),
            image: this.pickPrimaryImage(v),
          })),
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : 'unique field';
        // ví dụ target là "slug"
        throw new ConflictException(`Product với ${target} đã tồn tại`);
      }
      throw error;
    }
  }

  // ================= UPDATE (no asset changes here) =================
  async updateProductAndVariants(id: number, payload: UpdateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const existed = await tx.products.findUnique({ where: { product_id: id } });
      if (!existed) throw new NotFoundException(`Product ${id} không tồn tại`);

      if (payload.product) {
        await tx.products.update({
          where: { product_id: id },
          data: {
            brand_id: payload.product.brand_id ?? undefined,
            category_id: payload.product.category_id ?? undefined,
            product_name: payload.product.product_name ?? undefined,
            slug: payload.product.slug ?? undefined,
            description: payload.product.description ?? undefined,
            status: (payload.product.status as any) ?? undefined,
          },
        });
      }

      if (payload.variantIdsToDelete?.length) {
        await tx.product_variants.deleteMany({
          where: { product_id: id, variant_id: { in: payload.variantIdsToDelete.map(Number) } },
        });
      }

      for (const v of payload.variantsToUpsert ?? []) {
        if (v.variant_id) {
          await tx.product_variants.update({
            where: { variant_id: Number(v.variant_id) },
            data: {
              size_id: v.size_id ?? undefined,
              sku: v.sku ?? undefined,
              barcode: v.barcode ?? undefined, // cho phép update nếu gửi vào
              cost_price:
                v.cost_price != null ? new Prisma.Decimal(Number(v.cost_price)) : undefined,
              base_price:
                v.base_price != null ? new Prisma.Decimal(Number(v.base_price)) : undefined,
              quantity: v.quantity != null ? Number(v.quantity) : undefined,
              attribute: v.color
                ? ({ color: String(v.color) } as Prisma.InputJsonValue)
                : undefined,
            },
          });
        } else {
          // tạo mới
          const sizeId = Number(v.size_id);
          const color = String(v.color || '').trim();
          const sku =
            v.sku ??
            (await this.generateUniqueSku(
              tx,
              id,
              payload.product?.product_name ?? existed.product_name,
              sizeId,
              color,
            ));
          const barcode = v.barcode ?? (await this.generateBarcode(tx, id, sizeId, color));

          await tx.product_variants.create({
            data: {
              product_id: id,
              size_id: sizeId,
              sku,
              barcode,
              cost_price: v.cost_price != null ? new Prisma.Decimal(Number(v.cost_price)) : null,
              base_price: v.base_price != null ? new Prisma.Decimal(Number(v.base_price)) : null,
              quantity: v.quantity != null ? Number(v.quantity) : 0,
              status: true,
              attribute: { color } as Prisma.InputJsonValue,
            },
          });
        }
      }

      return tx.products.findUnique({
        where: { product_id: id },
        include: {
          product_variants: {
            include: { variant_assets: true, sizes: true },
            orderBy: { variant_id: 'asc' },
          },
          brands: true,
          categories: true,
        },
      });
    });
  }

  // ================= DELETE =================
  async deleteProduct(id: number) {
    const existed = await this.prisma.products.findUnique({ where: { product_id: id } });
    if (!existed) throw new NotFoundException(`Product ${id} không tồn tại`);
    await this.prisma.products.delete({ where: { product_id: id } });
    return { success: true };
  }

  // ================= VARIANT ASSETS (upload sau) =================
  async uploadVariantAsset(
    variantId: number,
    file: Express.Multer.File,
    isPrimary?: boolean,
  ): Promise<variant_assets> {
    const variant = await this.prisma.product_variants.findUnique({
      where: { variant_id: variantId },
    });
    if (!variant) throw new NotFoundException(`Variant #${variantId} not found`);

    const res = await this.cloudinary.uploadBuffer(
      file,
      `${process.env.CLOUDINARY_FOLDER || 'clothing_ecom'}/variant`,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.variant_assets.updateMany({
          where: { variant_id: variantId, is_primary: true },
          data: { is_primary: false },
        });
      }
      return tx.variant_assets.create({
        data: {
          variant_id: variantId,
          url: res.secure_url,
          type: 'image',
          is_primary: !!isPrimary,
        },
      });
    });
    return created;
  }

  async uploadVariantAssetsBatch(
    variantId: number,
    files: Express.Multer.File[],
  ): Promise<variant_assets[]> {
    // <-- khai báo return type
    const results: variant_assets[] = []; // <-- mảng typed
    for (let i = 0; i < files.length; i++) {
      const created = await this.uploadVariantAsset(variantId, files[i], i === 0);
      results.push(created); // created đã là variant_assets theo hàm trên
    }
    return results;
  }

  async setPrimaryAsset(variantId: number, assetId: number) {
    const asset = await this.prisma.variant_assets.findUnique({ where: { asset_id: assetId } });
    if (!asset || asset.variant_id !== variantId) throw new NotFoundException('Asset không hợp lệ');

    await this.prisma.$transaction(async (tx) => {
      await tx.variant_assets.updateMany({
        where: { variant_id: variantId, is_primary: true },
        data: { is_primary: false },
      });
      await tx.variant_assets.update({ where: { asset_id: assetId }, data: { is_primary: true } });
    });
    return { message: 'update successfully!' };
  }

  async deleteVariantAsset(variantId: number, assetId: number) {
    const remain = await this.prisma.variant_assets.count({ where: { variant_id: variantId } });
    if (remain <= 1) throw new BadRequestException('Variant phải còn ít nhất 1 ảnh');

    // 1) Lấy asset cần xoá và kiểm tra thuộc đúng variant
    const asset = await this.prisma.variant_assets.findUnique({ where: { asset_id: assetId } });
    if (!asset || asset.variant_id !== variantId) {
      throw new NotFoundException('Asset không hợp lệ');
    }

    // 2) Transaction: xoá asset; nếu nó là primary thì set primary cho phần tử đầu tiên còn lại
    await this.prisma.$transaction(async (tx) => {
      const wasPrimary = asset.is_primary;

      // Xoá record
      await tx.variant_assets.delete({ where: { asset_id: assetId } });

      if (wasPrimary) {
        // Lấy phần tử đầu tiên (asset_id nhỏ nhất) còn lại của variant
        const next = await tx.variant_assets.findFirst({
          where: { variant_id: variantId },
          orderBy: { asset_id: 'asc' },
        });
        if (next) {
          await tx.variant_assets.update({
            where: { asset_id: next.asset_id },
            data: { is_primary: true },
          });
        }
        // Nếu không còn ảnh nào khác, đơn giản là variant không có primary nữa
        // (nếu muốn chặn xoá khi chỉ còn 1 ảnh, có thể check count trước rồi throw)
      }
    });

    return { message: 'image deleted!' };
  }
}
