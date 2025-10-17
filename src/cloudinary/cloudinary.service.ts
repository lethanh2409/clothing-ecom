// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { Express } from 'express';

/** Kết quả destroy của Cloudinary (khai kiểu rõ ràng để tránh Promise<any>) */
type DestroyResult = {
  result?: string;
  [k: string]: unknown;
};

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
  }

  async uploadBuffer(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', unique_filename: true },
        (err, result) => {
          if (err) {
            const message = (err as Error)?.message ?? 'Cloudinary upload failed';
            return reject(new Error(message));
          }
          if (!result) return reject(new Error('No result from Cloudinary'));
          return resolve(result);
        },
      );

      // Narrow rõ ràng để ESLint không báo unsafe-member-access
      const f = file as unknown as { buffer?: Buffer };
      const buf = f.buffer;
      if (!buf) return reject(new Error('File buffer is empty'));
      stream.end(buf);
    });
  }

  async delete(publicId: string): Promise<DestroyResult> {
    const res = (await cloudinary.uploader.destroy(publicId)) as unknown as DestroyResult;
    return res;
  }
}
