// src/lookbooks/dtos/update-lookbook.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLookbookDto } from './create-lookbook.dto';

export class UpdateLookbookDto extends PartialType(CreateLookbookDto) {}
