import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lookbook } from './entities/lookbook.entity';
import { LookbookItem } from './entities/lookbook_items.entity';

@Injectable()
export class LookbooksService {
  constructor(
    @InjectRepository(Lookbook)
    private readonly lookbookRepo: Repository<Lookbook>,

    @InjectRepository(LookbookItem)
    private readonly lookbookItemRepo: Repository<LookbookItem>,
  ) {}

  // Lấy tất cả lookbook (kèm items và variant)
  async getAll() {
    return this.lookbookRepo.find({
      relations: ['items', 'items.variant', 'items.variant.product'],
      order: { created_at: 'DESC' },
    });
  }

  // Lấy 1 lookbook theo id
  async getOne(id: number) {
    const lookbook = await this.lookbookRepo.findOne({
      where: { lookbook_id: id },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });

    if (!lookbook) {
      throw new NotFoundException(`Lookbook with id ${id} not found`);
    }

    return lookbook;
  }

  // Lấy tất cả items trong 1 lookbook
  async getItems(id: number) {
    return this.lookbookItemRepo.find({
      where: { lookbook: { lookbook_id: id } },
      relations: ['variant', 'variant.product'],
      order: { position: 'ASC' },
    });
  }
}
