// src/cart/entities/cart-detail.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('cart_detail', { schema: 'clothing_ecom' })
export class CartDetail {
  @PrimaryGeneratedColumn()
  cart_detail_id: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Cart, (cart) => cart.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => ProductVariant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  sub_price: number;

  @Column()
  quantity: number;
}
