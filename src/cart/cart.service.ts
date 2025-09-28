// src/cart/cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartDetail } from './entities/cart-detail.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartDetail) private cartDetailRepo: Repository<CartDetail>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
  ) {}

  async getCartByCustomer(customerId: number): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { customer: { customer_id: customerId } },
      relations: [
        'details',
        'details.variant',
        'details.variant.assets', // vẫn join để lấy ảnh
      ],
    });

    if (!cart) {
      cart = this.cartRepo.create({ customer: { customer_id: customerId }, total_price: 0 });
      await this.cartRepo.save(cart);
    }

    // Map lại dữ liệu: chọn ảnh primary và loại bỏ assets
    cart.details = cart.details.map((d) => {
      const variant = d.variant;
      if (variant) {
        const primaryAsset =
          variant.assets?.find((a) => a.is_primary) || variant.assets?.[0] || null;

        return {
          ...d,
          variant: {
            ...variant,
            image: primaryAsset ? primaryAsset.url : null, // giữ 1 ảnh duy nhất
            assets: undefined, // loại bỏ assets khỏi response
          },
        };
      }
      return d;
    });

    return cart;
  }

  async addToCart(customerId: number, variantId: number, quantity: number): Promise<Cart> {
    const cart = await this.getCartByCustomer(customerId);
    const variant = await this.variantRepo.findOne({ where: { variant_id: variantId } });

    if (!variant) throw new NotFoundException('Variant not found');

    let detail = await this.cartDetailRepo.findOne({
      where: { cart: { cart_id: cart.cart_id }, variant: { variant_id: variantId } },
    });

    if (detail) {
      detail.quantity += quantity;
      detail.sub_price = Number(variant.base_price) * detail.quantity;
    } else {
      detail = this.cartDetailRepo.create({
        cart,
        variant,
        quantity,
        sub_price: Number(variant.base_price) * quantity,
      });
    }

    await this.cartDetailRepo.save(detail);
    await this.recalculateTotal(cart.cart_id);

    return this.getCartByCustomer(customerId);
  }

  async removeFromCart(customerId: number, variantId: number): Promise<Cart> {
    const cart = await this.getCartByCustomer(customerId);
    await this.cartDetailRepo.delete({
      cart: { cart_id: cart.cart_id },
      variant: { variant_id: variantId },
    });
    await this.recalculateTotal(cart.cart_id);
    return this.getCartByCustomer(customerId);
  }

  async updateQuantity(customerId: number, variantId: number, quantity: number): Promise<Cart> {
    const cart = await this.getCartByCustomer(customerId);
    const detail = await this.cartDetailRepo.findOne({
      where: { cart: { cart_id: cart.cart_id }, variant: { variant_id: variantId } },
    });

    if (!detail) throw new NotFoundException('Cart item not found');
    detail.quantity = quantity;
    detail.sub_price = Number(detail.variant.base_price) * quantity;
    await this.cartDetailRepo.save(detail);
    await this.recalculateTotal(cart.cart_id);
    return this.getCartByCustomer(customerId);
  }

  private async recalculateTotal(cartId: number): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: { cart_id: cartId },
      relations: ['details', 'details.variant'], // lấy cả variant để tính giá chắc chắn
    });

    if (!cart) {
      throw new Error(`Cart with id ${cartId} not found`);
    }

    // Nếu details rỗng thì gán []
    const details: CartDetail[] = cart.details || [];

    // Tính tổng tiền dựa trên variant.base_price * quantity (an toàn hơn sub_price)
    const total = details.reduce((sum: number, d: CartDetail) => {
      const price = Number(d.variant?.base_price ?? d.sub_price ?? 0);
      return sum + price * (d.quantity || 0);
    }, 0);

    cart.total_price = total;

    await this.cartRepo.save(cart);
  }
}
