import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

// ---- Types dùng lại cho kết quả include ----
type VariantWithAssets = Prisma.product_variantsGetPayload<{
  include: { variant_assets: true };
}>;

type ProductWithRelations = Prisma.productsGetPayload<{
  include: {
    product_variants: { include: { variant_assets: true } };
    brands: true;
    categories: true;
  };
}>;

type VariantWithAssetsAndProduct = Prisma.product_variantsGetPayload<{
  include: {
    variant_assets: true;
    products: { include: { brands: true; categories: true } };
  };
}>;

interface MappedProduct {
  product_id: number;
  product_name: string;
  brand: { brand_id: number; brand_name: string } | null;
  category: { category_id: number; category_name: string } | null;
  sku: string | null;
  price: number | null;
  size: string | null;
  color: string | null;
  image: string | null;
  status?: string | boolean;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========= Helpers =========
  private pickPrimaryImage(variant?: VariantWithAssets | null): string | null {
    const img = variant?.variant_assets?.find((a) => a.is_primary);
    return img?.url ?? null;
  }

  // attribute là JSONB (Prisma.JsonValue) -> đọc an toàn
  private readAttr(variant?: { attribute: Prisma.JsonValue | null } | null): {
    size: string | null;
    color: string | null;
  } {
    const j = variant?.attribute ?? null;
    if (!j || typeof j !== 'object' || Array.isArray(j)) return { size: null, color: null };
    const obj = j;

    const size = typeof obj.size === 'string' ? obj.size : null;
    const color = typeof obj.color === 'string' ? obj.color : null;
    return { size, color };
  }

  private mapListItem(p: ProductWithRelations): MappedProduct {
    const firstVariant = p.product_variants?.[0] ?? null;
    const { size, color } = this.readAttr(firstVariant);

    return {
      product_id: p.product_id,
      product_name: p.product_name,
      brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
      category: p.categories
        ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
        : null,
      sku: firstVariant?.sku ?? null,
      price: firstVariant?.base_price ? Number(firstVariant.base_price) : null,
      size,
      color,
      image: this.pickPrimaryImage(firstVariant),
      // tuỳ schema: boolean/enum -> giữ linh hoạt
      status: (p as unknown as { status?: string | boolean }).status,
    };
  }

  // ========= Queries =========

  // Admin: lấy tất cả product + variant đầu tiên (kèm ảnh chính)
  async getAllProductsWithFirstVariant(): Promise<MappedProduct[]> {
    const items = await this.prisma.products.findMany({
      include: {
        product_variants: {
          include: { variant_assets: true },
          orderBy: { variant_id: 'asc' },
        },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });

    return (items as ProductWithRelations[]).map((p) => this.mapListItem(p));
  }

  // Nếu status của bạn là enum (ACTIVE/OUT_OF_STOCK) thì để như dưới.
  // Nếu là boolean, sửa where: { status: true }.
  async getProductsByStatus(): Promise<MappedProduct[]> {
    const items = await this.prisma.products.findMany({
      where: { status: 'ACTIVE' as unknown as any }, // đổi sang true nếu là boolean
      include: {
        product_variants: { include: { variant_assets: true }, orderBy: { variant_id: 'asc' } },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });

    return (items as ProductWithRelations[]).map((p) => this.mapListItem(p));
  }

  // Lọc theo brand
  async getProductsByBrand(brandId: number): Promise<MappedProduct[]> {
    const items = await this.prisma.products.findMany({
      where: { brand_id: brandId },
      include: {
        product_variants: { include: { variant_assets: true }, orderBy: { variant_id: 'asc' } },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });

    return (items as ProductWithRelations[]).map((p) => this.mapListItem(p));
  }

  // Lọc theo category
  async getProductsByCategory(categoryId: number): Promise<MappedProduct[]> {
    const items = await this.prisma.products.findMany({
      where: { category_id: categoryId },
      include: {
        product_variants: { include: { variant_assets: true }, orderBy: { variant_id: 'asc' } },
        brands: true,
        categories: true,
      },
      orderBy: { product_id: 'asc' },
    });

    return (items as ProductWithRelations[]).map((p) => this.mapListItem(p));
  }

  // Sản phẩm mới nhất
  async getNewProducts() {
    const items = await this.prisma.products.findMany({
      include: {
        product_variants: { include: { variant_assets: true }, orderBy: { variant_id: 'asc' } },
        brands: true,
        categories: true,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return (items as ProductWithRelations[]).map((p) => {
      const firstVariant = p.product_variants?.[0] ?? null;
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
        category: p.categories
          ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
          : null,
        price: firstVariant?.base_price ? Number(firstVariant.base_price) : null,
        image: this.pickPrimaryImage(firstVariant),
      };
    });
  }

  // Phổ biến nhất (dựa trên tổng quantity đã bán)
  async getPopularProducts(limit = 10) {
    // Lấy top variant theo tổng số lượng bán
    const rows: Array<{ variant_id: number; total_sold: bigint | number | string }> = await this
      .prisma.$queryRaw`
        SELECT od.variant_id, SUM(od.quantity) AS total_sold
        FROM clothing_ecom.order_detail od
        JOIN clothing_ecom.orders o ON o.order_id = od.order_id
        WHERE o.order_status IN ('completed','delivered')
        GROUP BY od.variant_id
        ORDER BY SUM(od.quantity) DESC
        LIMIT ${limit};
      `;

    const variantIds = rows.map((r) => Number(r.variant_id));
    if (variantIds.length === 0) return [];

    // Lấy variants + product/brand/category + assets
    const variants = await this.prisma.product_variants.findMany({
      where: { variant_id: { in: variantIds } },
      include: {
        variant_assets: true,
        products: { include: { brands: true, categories: true } },
      },
    });

    const soldMap = new Map<number, number>(
      rows.map((r) => [Number(r.variant_id), Number(r.total_sold)]),
    );

    // gom theo product (mỗi product hiển thị theo variant phổ biến nhất)
    const bestByProduct = new Map<
      number,
      {
        product_id: number;
        product_name: string;
        brand: { brand_id: number; brand_name: string } | null;
        category: { category_id: number; category_name: string } | null;
        price: number | null;
        image: string | null;
        total_sold: number;
      }
    >();

    for (const v of variants as VariantWithAssetsAndProduct[]) {
      const p = v.products;
      const sold = soldMap.get(v.variant_id) ?? 0;

      const candidate = {
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
        category: p.categories
          ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
          : null,
        price: v.base_price ? Number(v.base_price) : null,
        image: this.pickPrimaryImage(v),
        total_sold: sold,
      };

      const current = bestByProduct.get(p.product_id);
      if (!current || sold > current.total_sold) bestByProduct.set(p.product_id, candidate);
    }

    return Array.from(bestByProduct.values())
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, limit);
  }

  // Chi tiết 1 sản phẩm
  async getProductById(productId: number) {
    const product = await this.prisma.products.findUnique({
      where: { product_id: productId },
      include: {
        product_variants: { include: { variant_assets: true } },
        brands: true,
        categories: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} không tồn tại`);
    }

    const p = product as ProductWithRelations;

    return {
      product_id: p.product_id,
      product_name: p.product_name,
      brand: p.brands ? { brand_id: p.brands.brand_id, brand_name: p.brands.brand_name } : null,
      category: p.categories
        ? { category_id: p.categories.category_id, category_name: p.categories.category_name }
        : null,
      variants: p.product_variants.map((v) => {
        const { size, color } = this.readAttr(v);
        return {
          variant_id: v.variant_id,
          sku: v.sku,
          price: v.base_price ? Number(v.base_price) : null,
          size,
          color,
          image: this.pickPrimaryImage(v),
        };
      }),
    };
  }
}
