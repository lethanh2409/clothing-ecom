import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async getAllProductsWithFirstVariant(): Promise<any[]> {
    const products = await this.productRepo.find({
      relations: ['variants', 'variants.assets', 'brand', 'category'],
    });

    return products.map((product) => {
      const firstVariant = product.variants[0];

      // lấy asset có is_primary = true
      const primaryAsset = firstVariant?.assets?.find((a) => a.is_primary);

      return {
        product_id: product.product_id,
        product_name: product.product_name,
        brand: {
          brand_id: product.brand?.brand_id,
          brand_name: product.brand?.brand_name,
        },
        category: {
          category_id: product.category?.category_id,
          category_name: product.category?.category_name,
        },
        sku: firstVariant?.sku || null,
        price: firstVariant?.base_price || null,
        size: firstVariant?.attribute?.size || null,
        color: firstVariant?.attribute?.color || null,
        image: primaryAsset?.url || null, // chỉ lấy ảnh chính
      };
    });
  }

  // Lấy sản phẩm cho khách hàng: chỉ ACTIVE và OUT_OF_STOCK
  async getProductsByStatus(): Promise<any[]> {
    const products = await this.productRepo.find({
      where: [{ status: 'ACTIVE' }, { status: 'OUT_OF_STOCK' }],
      relations: ['variants', 'variants.assets', 'brand', 'category'],
    });

    return products.map((product) => {
      const firstVariant = product.variants[0];

      // lấy asset có is_primary = true
      const primaryAsset = firstVariant?.assets?.find((a) => a.is_primary);
      return {
        product_id: product.product_id,
        product_name: product.product_name,
        brand: {
          brand_id: product.brand?.brand_id,
          brand_name: product.brand?.brand_name,
        },
        category: {
          category_id: product.category?.category_id,
          category_name: product.category?.category_name,
        },
        sku: firstVariant?.sku || null,
        price: firstVariant?.base_price || null,
        size: firstVariant?.attribute?.size || null,
        color: firstVariant?.attribute?.color || null,
        image: primaryAsset?.url || null, // chỉ lấy ảnh chính
        status: product.status, // để FE biết disable nút mua
      };
    });
  }

  // Lọc theo brand
  async getProductsByBrand(brandId: number): Promise<any[]> {
    const products = await this.productRepo.find({
      where: { brand: { brand_id: brandId } },
      relations: ['variants', 'variants.assets', 'brand', 'category'],
    });

    return products.map((product) => {
      const firstVariant = product.variants[0];

      // lấy asset có is_primary = true
      const primaryAsset = firstVariant?.assets?.find((a) => a.is_primary);
      return {
        product_id: product.product_id,
        product_name: product.product_name,
        brand: {
          brand_id: product.brand?.brand_id,
          brand_name: product.brand?.brand_name,
        },
        category: {
          category_id: product.category?.category_id,
          category_name: product.category?.category_name,
        },
        sku: firstVariant?.sku || null,
        price: firstVariant?.base_price || null,
        size: firstVariant?.attribute?.size || null,
        color: firstVariant?.attribute?.color || null,
        image: primaryAsset?.url || null, // chỉ lấy ảnh chính
      };
    });
  }

  // Lọc theo category
  async getProductsByCategory(categoryId: number): Promise<any[]> {
    const products = await this.productRepo.find({
      where: { category: { category_id: categoryId } },
      relations: ['variants', 'variants.assets', 'brand', 'category'],
    });

    return products.map((product) => {
      const firstVariant = product.variants[0];

      // lấy asset có is_primary = true
      const primaryAsset = firstVariant?.assets?.find((a) => a.is_primary);
      return {
        product_id: product.product_id,
        product_name: product.product_name,
        brand: {
          brand_id: product.brand?.brand_id,
          brand_name: product.brand?.brand_name,
        },
        category: {
          category_id: product.category?.category_id,
          category_name: product.category?.category_name,
        },
        sku: firstVariant?.sku || null,
        price: firstVariant?.base_price || null,
        size: firstVariant?.attribute?.size || null,
        color: firstVariant?.attribute?.color || null,
        image: primaryAsset?.url || null, // chỉ lấy ảnh chính
      };
    });
  }

  // products.service.ts
  async getProductById(productId: number): Promise<any> {
    const product = await this.productRepo.findOne({
      where: { product_id: productId },
      relations: ['variants', 'variants.assets', 'brand', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} không tồn tại`);
    }

    const firstVariant = product.variants[0];
    // lấy asset có is_primary = true
    const primaryAsset = firstVariant?.assets?.find((a) => a.is_primary);
    return {
      product_id: product.product_id,
      product_name: product.product_name,
      brand: {
        brand_id: product.brand?.brand_id,
        brand_name: product.brand?.brand_name,
      },
      category: {
        category_id: product.category?.category_id,
        category_name: product.category?.category_name,
      },
      sku: firstVariant?.sku || null,
      price: firstVariant?.base_price || null,
      size: firstVariant?.attribute?.size || null,
      color: firstVariant?.attribute?.color || null,
      image: primaryAsset?.url || null, // chỉ lấy ảnh chính
    };
  }
}
