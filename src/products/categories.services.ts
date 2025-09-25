// src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // Lấy tất cả category
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  // Lấy category theo status = 'active'
  async getCategoriesByStatus(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { status: 'active' },
    });
  }
}
