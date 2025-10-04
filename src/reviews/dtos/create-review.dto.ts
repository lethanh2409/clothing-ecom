// create-review.dto.ts
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  orderDetailId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
