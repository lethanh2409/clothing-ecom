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
import { FilterProductDto } from './dtos/filter-product.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';

// ===== Types kết quả =====
type VariantWithAssets = Prisma.product_variantsGetPayload<{
  include: { variant_assets: true; sizes: true };
}>;

// Thêm type này cho mapVariantFull
type VariantWithRelations = Prisma.product_variantsGetPayload<{
  include: {
    variant_assets: true;
    sizes: true;
  };
}>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly embedding: EmbeddingService,
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
    const colorCode = Math.abs(this.simpleHash(color)) % 1000;
    const base =
      `${(product_id % 1000).toString().padStart(3, '0')}${(size_id % 100).toString().padStart(2, '0')}${Date.now() % 1_000_000}`
        .padStart(9, '0')
        .slice(-9);
    let body = `200${base.slice(0, 6)}${colorCode.toString().padStart(3, '0')}`;
    let ean = body + this.ean13Checksum(body);

    let i = 0;
    while (await tx.product_variants.findFirst({ where: { barcode: ean } })) {
      const bump = (++i % 1000).toString().padStart(3, '0');
      body = body.slice(0, 9) + bump;
      ean = body + this.ean13Checksum(body);
    }
    return ean;
  }

  private simpleHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  private mapVariantFull(v: VariantWithRelations) {
    const price = v.base_price ? v.base_price.toNumber() : null;
    const attr = v.attribute;

    return {
      variant_id: v.variant_id,
      sku: v.sku,
      barcode: v.barcode,
      price,
      quantity: v.quantity,
      status: v.status,
      size: v.sizes?.size_label ?? null,
      gender: v.sizes?.gender ?? null,
      size_type: v.sizes?.type ?? null,
      attributes: attr,
      color: this.readColor(v),
      assets: v.variant_assets.map((a) => ({
        asset_id: a.asset_id,
        url: a.url,
        type: a.type,
        is_primary: a.is_primary,
      })),
      primary_image: this.pickPrimaryImage(v),
    };
  }

  // ================= Queries =================

  /**
   * Lấy tất cả variants kèm thông tin product (cho màn hình quản lý tồn kho)
   * Return: Danh sách variants với đầy đủ thông tin product, brand, category
   */
  async getAllVariants() {
    const variants = await this.prisma.product_variants.findMany({
      include: {
        sizes: true,
        variant_assets: true,
        products: {
          include: {
            brands: true,
            categories: true,
          },
        },
      },
      orderBy: [{ product_id: 'asc' }, { variant_id: 'asc' }],
    });

    return variants.map((v) => ({
      // Variant info
      variant_id: v.variant_id,
      sku: v.sku,
      barcode: v.barcode,
      price: v.base_price ? v.base_price.toNumber() : null,
      quantity: v.quantity,
      status: v.status,
      created_at: v.created_at,
      updated_at: v.updated_at,

      // Size info
      size: v.sizes
        ? {
            size_id: v.sizes.size_id,
            size_label: v.sizes.size_label,
            gender: v.sizes.gender,
            type: v.sizes.type,
          }
        : null,

      // Attributes (color, material, etc.)
      attributes: v.attribute,
      color: this.readColor(v),

      // Images
      primary_image: this.pickPrimaryImage(v),
      assets: v.variant_assets.map((a) => ({
        asset_id: a.asset_id,
        url: a.url,
        type: a.type,
        is_primary: a.is_primary,
      })),

      // Product info
      product: {
        product_id: v.products.product_id,
        product_name: v.products.product_name,
        slug: v.products.slug,
        description: v.products.description,
        status: v.products.status,
        brand: v.products.brands
          ? {
              brand_id: v.products.brands.brand_id,
              brand_name: v.products.brands.brand_name,
              slug: v.products.brands.slug,
            }
          : null,
        category: v.products.categories
          ? {
              category_id: v.products.categories.category_id,
              category_name: v.products.categories.category_name,
              slug: v.products.categories.slug,
            }
          : null,
      },
    }));
  }

  /**
   * Lấy variants theo filter (cho quản lý tồn kho với search/filter)
   */
  async getVariantsWithFilters(filters?: {
    brand_id?: number;
    category_id?: number;
    status?: boolean;
    search?: string; // Search by product name, SKU, barcode
    low_stock?: number; // Variants có quantity <= threshold
  }) {
    const where: Prisma.product_variantsWhereInput = {};

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }

    if (filters?.low_stock !== undefined) {
      where.quantity = { lte: filters.low_stock };
    }

    if (filters?.search) {
      const search = filters.search.trim();
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        {
          products: {
            product_name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Build products filter object
    const productsFilter: Prisma.productsWhereInput = {};

    if (filters?.brand_id) {
      productsFilter.brand_id = filters.brand_id;
    }

    if (filters?.category_id) {
      productsFilter.category_id = filters.category_id;
    }

    // Only add products filter if there are conditions
    if (Object.keys(productsFilter).length > 0) {
      where.products = productsFilter;
    }

    const variants = await this.prisma.product_variants.findMany({
      where,
      include: {
        sizes: true,
        variant_assets: true,
        products: {
          include: {
            brands: true,
            categories: true,
          },
        },
      },
      orderBy: [{ product_id: 'asc' }, { variant_id: 'asc' }],
    });

    return variants.map((v) => ({
      variant_id: v.variant_id,
      sku: v.sku,
      barcode: v.barcode,
      price: v.base_price ? v.base_price.toNumber() : null,
      quantity: v.quantity,
      status: v.status,
      created_at: v.created_at,
      updated_at: v.updated_at,
      size: v.sizes
        ? {
            size_id: v.sizes.size_id,
            size_label: v.sizes.size_label,
            gender: v.sizes.gender,
            type: v.sizes.type,
          }
        : null,
      attributes: v.attribute,
      color: this.readColor(v),
      primary_image: this.pickPrimaryImage(v),
      assets: v.variant_assets.map((a) => ({
        asset_id: a.asset_id,
        url: a.url,
        type: a.type,
        is_primary: a.is_primary,
      })),
      product: {
        product_id: v.products.product_id,
        product_name: v.products.product_name,
        slug: v.products.slug,
        description: v.products.description,
        status: v.products.status,
        brand: v.products.brands
          ? {
              brand_id: v.products.brands.brand_id,
              brand_name: v.products.brands.brand_name,
              slug: v.products.brands.slug,
            }
          : null,
        category: v.products.categories
          ? {
              category_id: v.products.categories.category_id,
              category_name: v.products.categories.category_name,
              slug: v.products.categories.slug,
            }
          : null,
      },
    }));
  }

  async getAllProductsWithVariants() {
    const items = await this.prisma.products.findMany({
      include: {
        product_variants: {
          include: {
            sizes: true,
            variant_assets: true,
          },
          orderBy: { variant_id: 'asc' },
        },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });

    return items.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      slug: p.slug,
      description: p.description,
      brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
      category: p.categories
        ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
        : null,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      variants: p.product_variants.map((v) => this.mapVariantFull(v)),
    }));
  }

  async getProductsByStatus(status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' = 'ACTIVE') {
    const items = await this.prisma.products.findMany({
      where: { status },
      include: {
        product_variants: {
          include: {
            sizes: true,
            variant_assets: true,
          },
          orderBy: { variant_id: 'asc' },
        },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });

    return items.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      slug: p.slug,
      description: p.description,
      brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
      category: p.categories
        ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
        : null,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      variants: p.product_variants.map((v) => this.mapVariantFull(v)),
    }));
  }

  async getProductById(productId: number) {
    const product = await this.prisma.products.findUnique({
      where: { product_id: productId },
      include: {
        product_variants: {
          include: {
            sizes: true,
            variant_assets: true,
          },
          orderBy: { variant_id: 'asc' },
        },
        brands: true,
        categories: true,
      },
    });

    if (!product) throw new NotFoundException(`Product ${productId} không tồn tại`);

    return {
      product_id: product.product_id,
      product_name: product.product_name,
      slug: product.slug,
      description: product.description,
      brand: product.brands
        ? { brand_id: product.brands.brand_id, brand_name: product.brands.brand_name }
        : null,
      category: product.categories
        ? {
            category_id: product.categories.category_id,
            category_name: product.categories.category_name,
          }
        : null,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      variants: product.product_variants.map((v) => this.mapVariantFull(v)),
    };
  }

  // ================= CREATE (no assets) =================
  /**
   * CREATE with auto-sync to vector store
   */
  async createProductWithVariants(input: CreateProductDto) {
    if (!Array.isArray(input.variants) || input.variants.length === 0) {
      throw new BadRequestException('`variants` must be a non-empty array');
    }

    if (input.slug) {
      const existedSlug = await this.prisma.products.findUnique({ where: { slug: input.slug } });
      if (existedSlug) {
        throw new ConflictException('Slug đã tồn tại, vui lòng chọn slug khác');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Tạo product
        const product = await tx.products.create({
          data: {
            brand_id: input.brand_id,
            category_id: input.category_id,
            product_name: String(input.product_name),
            slug: input.slug ?? String(input.product_name).toLowerCase().replace(/\s+/g, '-'),
            description: input.description ?? '',
            status: (input.status as any) ?? 'ACTIVE',
          },
        });

        // 2. Kiểm tra trùng lặp variants
        const seen = new Set<string>();
        for (const v of input.variants) {
          const key = `${Number(v.size_id)}::${String(v.color).trim().toLowerCase()}`;
          if (seen.has(key)) throw new ConflictException(`Biến thể bị trùng (size,color): ${key}`);
          seen.add(key);
        }

        // 3. Lấy brand & category để sync
        const brand = await tx.brands.findUnique({ where: { brand_id: input.brand_id } });
        const category = await tx.categories.findUnique({
          where: { category_id: input.category_id },
        });

        // 4. Tạo variants và sync từng cái
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

          const variant = await tx.product_variants.create({
            data: {
              product_id: product.product_id,
              size_id: Number(v.size_id),
              sku,
              barcode,
              base_price: v.base_price,
              quantity: v.quantity != null ? Number(v.quantity) : 0,
              status: true,
              attribute: { color } as any,
            },
          });

          // ⭐ Sync variant to vector store
          try {
            const size = await tx.sizes.findUnique({ where: { size_id: Number(v.size_id) } });
            await this.embedding.syncVariant(variant, product, brand, category, size);
          } catch (error) {
            console.error('❌ Failed to sync variant to vector store:', error);
            // Không throw error để không block việc tạo product
          }
        }

        // 5. Trả về kết quả
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

        return {
          product_id: raw!.product_id,
          product_name: raw!.product_name,
          slug: raw!.slug,
          description: raw!.description,
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
            barcode: v.barcode,
            price: v.base_price != null ? Number(v.base_price) : null,
            quantity: v.quantity,
            size: v.sizes?.size_label ?? null,
            color: this.readColor(v),
            image: this.pickPrimaryImage(v),
          })),
        };
      });
    } catch (error) {
      console.error('❌ Failed to sync variant to vector store:', error);
      throw error;
    }
  }

  // ================= UPDATE (no asset changes here) =================
  async updateProductAndVariants(id: number, payload: UpdateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const existed = await tx.products.findUnique({
        where: { product_id: id },
        include: { brands: true, categories: true },
      });
      if (!existed) throw new NotFoundException(`Product ${id} không tồn tại`);

      // 1. Update product info
      let updatedProduct = existed;
      if (payload.product) {
        updatedProduct = await tx.products.update({
          where: { product_id: id },
          data: {
            brand_id: payload.product.brand_id ?? undefined,
            category_id: payload.product.category_id ?? undefined,
            product_name: payload.product.product_name ?? undefined,
            slug: payload.product.slug ?? undefined,
            description: payload.product.description ?? undefined,
            status: (payload.product.status as any) ?? undefined,
          },
          include: { brands: true, categories: true },
        });
      }

      // 2. Delete variants
      if (payload.variantIdsToDelete?.length) {
        // ⭐ Delete from vector store first
        const variantsToDelete = await tx.product_variants.findMany({
          where: { product_id: id, variant_id: { in: payload.variantIdsToDelete.map(Number) } },
        });

        for (const v of variantsToDelete) {
          try {
            await this.embedding.deleteDocument(v.sku);
          } catch (error) {
            console.error('❌ Failed to delete variant from vector store:', error);
          }
        }

        await tx.product_variants.deleteMany({
          where: { product_id: id, variant_id: { in: payload.variantIdsToDelete.map(Number) } },
        });
      }

      // 3. Upsert variants
      for (const v of payload.variantsToUpsert ?? []) {
        if (v.variant_id) {
          // Update existing variant
          const updated = await tx.product_variants.update({
            where: { variant_id: Number(v.variant_id) },
            data: {
              size_id: v.size_id ?? undefined,
              sku: v.sku ?? undefined,
              barcode: v.barcode ?? undefined,
              base_price: v.base_price != null ? Number(v.base_price) : undefined,
              quantity: v.quantity != null ? Number(v.quantity) : undefined,
              attribute: v.color ? ({ color: String(v.color) } as any) : undefined,
            },
            include: { sizes: true },
          });

          // ⭐ Re-sync to vector store
          try {
            await this.embedding.syncVariant(
              updated,
              updatedProduct,
              updatedProduct.brands,
              updatedProduct.categories,
              updated.sizes,
            );
          } catch (error) {
            console.error('❌ Failed to sync updated variant:', error);
          }
        } else {
          // Create new variant
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

          const created = await tx.product_variants.create({
            data: {
              product_id: id,
              size_id: sizeId,
              sku,
              barcode,
              base_price: v.base_price ?? 0,
              quantity: v.quantity != null ? Number(v.quantity) : 0,
              status: true,
              attribute: { color } as any,
            },
            include: { sizes: true },
          });

          // ⭐ Sync new variant
          try {
            await this.embedding.syncVariant(
              created,
              updatedProduct,
              updatedProduct.brands,
              updatedProduct.categories,
              created.sizes,
            );
          } catch (error) {
            console.error('❌ Failed to sync new variant:', error);
          }
        }
      }

      const result = await tx.products.findUnique({
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

      return result;
    });
  }

  // ================= SOFT DELETE =================
  async deleteProduct(id: number) {
    const existed = await this.prisma.products.findUnique({
      where: { product_id: id },
    });

    if (!existed) {
      throw new NotFoundException(`Product ${id} không tồn tại`);
    }

    // Soft delete: đổi status
    const updated = await this.prisma.products.update({
      where: { product_id: id },
      data: {
        status: 'INACTIVE',
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: `Đã chuyển sản phẩm ${id} sang trạng thái INACTIVE`,
      product: updated,
    };
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
    const results: variant_assets[] = [];
    for (let i = 0; i < files.length; i++) {
      const created = await this.uploadVariantAsset(variantId, files[i], i === 0);
      results.push(created);
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

    const asset = await this.prisma.variant_assets.findUnique({ where: { asset_id: assetId } });
    if (!asset || asset.variant_id !== variantId) {
      throw new NotFoundException('Asset không hợp lệ');
    }

    await this.prisma.$transaction(async (tx) => {
      const wasPrimary = asset.is_primary;

      await tx.variant_assets.delete({ where: { asset_id: assetId } });

      if (wasPrimary) {
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
      }
    });

    return { message: 'image deleted!' };
  }

  async filter(query: FilterProductDto) {
    const { brand_id, category_id, keyword, min_price, max_price } = query;

    const where: any = {
      status: 'ACTIVE',
    };

    // Brand filter
    if (brand_id?.length) {
      where.brand_id = { in: brand_id };
    }

    // Category filter
    if (category_id?.length) {
      where.category_id = { in: category_id };
    }

    // Keyword filter
    if (keyword) {
      where.OR = [
        { product_name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Price filter inside variants
    if (min_price || max_price) {
      where.product_variants = {
        some: {
          AND: [
            min_price ? { base_price: { gte: min_price } } : {},
            max_price ? { base_price: { lte: max_price } } : {},
          ],
        },
      };
    }

    const products = await this.prisma.products.findMany({
      where,
      include: {
        brands: true,
        categories: true,
        product_variants: {
          include: { variant_assets: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Convert Decimal → Number
    return products.map((product) => ({
      ...product,
      product_variants: product.product_variants.map((variant) => ({
        ...variant,
        base_price: Number(variant.base_price),
      })),
    }));
  }
}
