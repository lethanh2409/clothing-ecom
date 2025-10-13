import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  slug: string;
}
