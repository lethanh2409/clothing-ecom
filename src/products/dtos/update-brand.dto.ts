import { IsOptional } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  brand_name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  status?: boolean;

  @IsOptional()
  slug?: string;

  @IsOptional()
  logo_url?: string;
}
