// src/brands/brands.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  // Lấy tất cả brand (admin xem hết)
  async getAllBrands(): Promise<Brand[]> {
    return this.brandRepo.find();
  }

  // Lấy brand theo status = 'active'
  async getBrandsByStatus(): Promise<Brand[]> {
    return this.brandRepo.find({
      where: { status: 'active' },
    });
  }
}
