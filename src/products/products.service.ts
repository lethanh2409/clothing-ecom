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

  // Lấy tất cả variant của 1 product
  async getVariants(productId: number): Promise<ProductVariant[]> {
    const product = await this.productRepo.findOne({
      where: { product_id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} không tồn tại`);
    }

    return product.variants;
  }

  // Lấy toàn bộ variant (bất kể product)
  async getAllVariants(): Promise<ProductVariant[]> {
    return this.variantRepo.find({
      relations: ['product'],
    });
  }
}
