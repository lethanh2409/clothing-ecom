// src/orders/dto/create-order.dto.ts
import { IsInt, Min, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  customerId: number;

  @IsInt()
  @Min(1)
  addressId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
