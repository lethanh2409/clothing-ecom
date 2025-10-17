// src/lib/imageUpload.ts
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type Entity = 'brand' | 'lookbook' | 'variant';

type UploadInput = {
  entity: Entity;
  id: number;
  /** Có thể là đường dẫn file local, hoặc data URL/base64, hoặc Buffer dạng "streaming" (dùng uploader.upload_stream) */
  file: string;
  /** nếu entity=variant: có thể set ảnh chính */
  isPrimary?: boolean;
  /** type của asset (ví dụ: 'image', 'video'…) nếu muốn lưu vào cột `type` của variant_assets */
  assetType?: string;
  /** Cloudinary options bổ sung (resize, format…) */
  options?: UploadApiOptions;
};

/**
 * Upload ảnh lên Cloudinary và gắn vào entity tương ứng trong DB.
 * Trả về record đã cập nhật/tạo.
 */
export async function uploadImageAndAttach({
  entity,
  id,
  file,
  isPrimary = false,
  assetType = 'image',
  options = {},
}: UploadInput) {
  // 1) Upload lên Cloudinary
  const folder = process.env.CLOUDINARY_FOLDER || 'uploads';
  const uploadRes: UploadApiResponse = await cloudinary.uploader.upload(file, {
    folder: `${folder}/${entity}`,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
    use_filename: false,
    transformation: options.transformation, // cho phép pass resize/crop nếu muốn
    ...options,
  });

  const imageUrl = uploadRes.secure_url;

  // 2) Gắn vào DB theo entity
  if (entity === 'brand') {
    // cập nhật logo_url
    const updated = await prisma.brands.update({
      where: { brand_id: id },
      data: { logo_url: imageUrl },
    });
    return updated;
  }

  if (entity === 'lookbook') {
    // cập nhật image
    const updated = await prisma.lookbooks.update({
      where: { lookbook_id: id },
      data: { image: imageUrl },
    });
    return updated;
  }

  if (entity === 'variant') {
    // Tạo asset mới; nếu isPrimary=true thì bỏ cờ is_primary cũ trong cùng variant
    return await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.variant_assets.updateMany({
          where: { variant_id: id, is_primary: true },
          data: { is_primary: false },
        });
      }

      const created = await tx.variant_assets.create({
        data: {
          variant_id: id,
          url: imageUrl,
          type: assetType,
          is_primary: isPrimary,
        },
      });

      // Có thể trả về đầy đủ variant + assets
      const variantWithAssets = await tx.product_variants.findUnique({
        where: { variant_id: id },
        include: { variant_assets: true },
      });

      return { createdAsset: created, variant: variantWithAssets };
    });
  }

  throw new Error('Unsupported entity');
}
