import { ProductVariant } from './product-variant.entity';

export class VariantAsset {
  asset_id: number;

  variant_id: number;

  url: string;

  type: string; // ví dụ: image, video

  is_primary: boolean;

  variant: ProductVariant;
}
