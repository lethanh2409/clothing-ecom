import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Voucher } from './entities/vouchers.entity';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { UpdateVoucherDto } from './dtos/update-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
  ) {}

  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const voucher = this.voucherRepo.create(dto);
    return this.voucherRepo.save(voucher);
  }

  async findAll(): Promise<Voucher[]> {
    return this.voucherRepo.find();
  }

  async findOne(id: number): Promise<Voucher> {
    const voucher = await this.voucherRepo.findOne({ where: { voucher_id: id } });
    if (!voucher) throw new NotFoundException(`Voucher #${id} not found`);
    return voucher;
  }

  async update(id: number, dto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.findOne(id);
    Object.assign(voucher, dto);
    return this.voucherRepo.save(voucher);
  }

  async remove(id: number): Promise<Voucher> {
    const voucher = await this.findOne(id); // vẫn check tồn tại
    voucher.status = false; // đánh dấu vô hiệu
    return this.voucherRepo.save(voucher); // lưu lại
  }

  async findActive(): Promise<Voucher[]> {
    const today = new Date();
    return this.voucherRepo.find({
      where: [
        {
          status: true,
          start_date: LessThanOrEqual(today),
          end_date: MoreThanOrEqual(today),
        },
      ],
    });
  }
}
