import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type CartWithItems = Prisma.cartGetPayload<{
  include: {
    cart_detail: {
      include: {
        product_variants: {
          include: {
            variant_assets: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convert Decimal to number (toJSON compatible)
   */
  private decimalToNumber(value: Prisma.Decimal | null | undefined): number {
    if (!value) return 0;
    return parseFloat(value.toString());
  }

  /**
   * Format cart response - convert Decimal fields to number
   */
  private formatCartResponse(cart: CartWithItems) {
    return {
      ...cart,
      total_price: this.decimalToNumber(cart.total_price),
      cart_detail: cart.cart_detail.map((item) => ({
        ...item,
        sub_price: this.decimalToNumber(item.sub_price),
        product_variants: {
          ...item.product_variants,
          base_price: this.decimalToNumber(item.product_variants?.base_price),
        },
      })),
    };
  }

  /**
   * Lấy giỏ hàng của customer (tạo nếu chưa có)
   */
  async getCartByCustomer(customerId: number) {
    let cart = await this.prisma.cart.findFirst({
      where: { customer_id: customerId },
      include: {
        cart_detail: {
          include: {
            product_variants: {
              include: { variant_assets: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customer_id: customerId },
        include: {
          cart_detail: {
            include: {
              product_variants: { include: { variant_assets: true } },
            },
          },
        },
      });
    }

    return this.formatCartResponse(cart as CartWithItems);
  }

  /**
   * Thêm sản phẩm (variant) vào giỏ
   */
  async addToCart(customerId: number, variantId: number, quantity: number) {
    if (quantity <= 0) throw new NotFoundException('Quantity must be > 0');

    const cart = await this.prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findFirst({ where: { customer_id: customerId } });
      if (!cart) {
        cart = await tx.cart.create({ data: { customer_id: customerId } });
      }

      const variant = await tx.product_variants.findUnique({
        where: { variant_id: variantId },
      });
      if (!variant) throw new NotFoundException('Variant not found');

      const existing = await tx.cart_detail.findUnique({
        where: {
          cart_id_variant_id: { cart_id: cart.cart_id, variant_id: variantId },
        },
      });

      const basePrice = variant.base_price ?? new Prisma.Decimal(0);

      if (existing) {
        const newQty = existing.quantity + quantity;
        await tx.cart_detail.update({
          where: { cart_detail_id: existing.cart_detail_id },
          data: {
            quantity: newQty,
            sub_price: basePrice.mul(newQty),
          },
        });
      } else {
        await tx.cart_detail.create({
          data: {
            cart_id: cart.cart_id,
            variant_id: variantId,
            quantity,
            sub_price: basePrice.mul(quantity),
          },
        });
      }

      await this.recalculateTotalTx(tx, cart.cart_id);

      const full = await tx.cart.findUnique({
        where: { cart_id: cart.cart_id },
        include: {
          cart_detail: {
            include: {
              product_variants: { include: { variant_assets: true } },
            },
          },
        },
      });

      return full as CartWithItems;
    });

    return this.formatCartResponse(cart);
  }

  /**
   * Cập nhật số lượng item
   */
  async updateQuantity(customerId: number, variantId: number, quantity: number) {
    const cart = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({ where: { customer_id: customerId } });
      if (!cart) throw new NotFoundException('Cart not found');

      const detail = await tx.cart_detail.findUnique({
        where: { cart_id_variant_id: { cart_id: cart.cart_id, variant_id: variantId } },
        include: { product_variants: true },
      });
      if (!detail) throw new NotFoundException('Cart item not found');

      if (quantity <= 0) {
        await tx.cart_detail.delete({ where: { cart_detail_id: detail.cart_detail_id } });
      } else {
        const price = detail.product_variants?.base_price ?? new Prisma.Decimal(0);
        await tx.cart_detail.update({
          where: { cart_detail_id: detail.cart_detail_id },
          data: {
            quantity,
            sub_price: price.mul(quantity),
          },
        });
      }

      await this.recalculateTotalTx(tx, cart.cart_id);

      const full = await tx.cart.findUnique({
        where: { cart_id: cart.cart_id },
        include: {
          cart_detail: {
            include: {
              product_variants: { include: { variant_assets: true } },
            },
          },
        },
      });
      return full as CartWithItems;
    });

    return this.formatCartResponse(cart);
  }

  /**
   * Xoá 1 item khỏi giỏ
   */
  async removeFromCart(customerId: number, variantId: number) {
    const cart = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({ where: { customer_id: customerId } });
      if (!cart) throw new NotFoundException('Cart not found');

      await tx.cart_detail.deleteMany({
        where: { cart_id: cart.cart_id, variant_id: variantId },
      });

      await this.recalculateTotalTx(tx, cart.cart_id);

      const full = await tx.cart.findUnique({
        where: { cart_id: cart.cart_id },
        include: {
          cart_detail: {
            include: {
              product_variants: { include: { variant_assets: true } },
            },
          },
        },
      });
      return full as CartWithItems;
    });

    return this.formatCartResponse(cart);
  }

  /**
   * (Private) Tính lại total trong transaction
   */
  private async recalculateTotalTx(tx: Prisma.TransactionClient, cartId: number): Promise<void> {
    const details = await tx.cart_detail.findMany({
      where: { cart_id: cartId },
      include: { product_variants: true },
    });

    let total = new Prisma.Decimal(0);
    for (const d of details) {
      const price = d.product_variants?.base_price ?? new Prisma.Decimal(0);
      total = total.add(price.mul(d.quantity));
    }

    await tx.cart.update({
      where: { cart_id: cartId },
      data: { total_price: total },
    });
  }
}
