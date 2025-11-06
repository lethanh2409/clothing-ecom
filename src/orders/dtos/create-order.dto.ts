// src/orders/dto/create-order.dto.ts
import {
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  addressId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsInt()
  voucherId?: number;

  @IsNumber()
  @Min(0)
  totalPrice: number; // Frontend tính và gửi lên để BE verify

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotalPrice?: number; // Tổng tiền trước giảm giá (optional, BE sẽ tính lại)

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number; // Số tiền giảm (optional, BE sẽ tính lại)
}
