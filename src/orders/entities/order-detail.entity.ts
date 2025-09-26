import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Entity('order_detail', { schema: 'clothing_ecom' })
export class OrderDetail {
  @PrimaryGeneratedColumn()
  order_detail_id: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Order, (order) => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant, (variant) => variant.orderDetails)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total_price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount_price: number;
}
