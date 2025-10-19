// src/variants/dtos/upload-asset.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';
export class UploadVariantAssetDto {
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
