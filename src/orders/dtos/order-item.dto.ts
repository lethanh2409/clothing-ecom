import { IsInt, Min } from 'class-validator';

export class OrderItemDto {
  @IsInt()
  @Min(1)
  variantId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
