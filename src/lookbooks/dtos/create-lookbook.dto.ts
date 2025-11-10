// src/lookbooks/dtos/create-lookbook.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CreateLookbookDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // nếu client đã có URL có thể gửi thẳng
  @IsOptional()
  @IsString()
  image?: string;
}
