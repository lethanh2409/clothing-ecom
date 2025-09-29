// src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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

  // Lấy tất cả category cha (parent_id IS NULL)
  async getParentCategories() {
    return this.categoryRepo.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  // Lấy tất cả category con theo parent_id
  async getSubCategories(parentId: number) {
    return this.categoryRepo.find({
      where: { parent: { category_id: parentId } },
      relations: ['children'],
    });
  }
}
