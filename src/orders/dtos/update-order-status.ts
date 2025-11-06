// src/orders/dtos/update-order-status.dto.ts
import { IsIn, IsString, IsOptional } from 'class-validator';

// Định nghĩa constant thay vì enum
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentStatusType = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export class UpdateOrderStatusDto {
  @IsIn(Object.values(ORDER_STATUS), { message: 'Trạng thái đơn hàng không hợp lệ' })
  orderStatus: OrderStatusType;

  @IsIn(Object.values(PAYMENT_STATUS), { message: 'Trạng thái thanh toán không hợp lệ' })
  @IsOptional()
  paymentStatus?: PaymentStatusType;

  @IsString()
  @IsOptional()
  note?: string;
}
