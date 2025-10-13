// src/vouchers/vouchers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, vouchers } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { UpdateVoucherDto } from './dtos/update-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVoucherDto): Promise<vouchers> {
    // dto phải khớp schema Prisma (title, description?, discount_type, discount_value, min_order_value, max_discount?, quantity, used_count?, per_customer_limit?, start_date, end_date, status)
    return this.prisma.vouchers.create({ data: dto as Prisma.vouchersCreateInput });
  }

  async findAll(): Promise<vouchers[]> {
    return this.prisma.vouchers.findMany();
  }

  async findOne(id: number): Promise<vouchers> {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { voucher_id: id },
    });
    if (!voucher) throw new NotFoundException(`Voucher #${id} not found`);
    return voucher;
  }

  async update(id: number, dto: UpdateVoucherDto): Promise<vouchers> {
    // đảm bảo tồn tại trước khi update (giữ thông báo NotFound đẹp)
    await this.findOne(id);
    return this.prisma.vouchers.update({
      where: { voucher_id: id },
      data: dto as Prisma.vouchersUpdateInput,
    });
  }

  // Soft delete: set status=false
  async remove(id: number): Promise<vouchers> {
    // đảm bảo tồn tại
    await this.findOne(id);
    return this.prisma.vouchers.update({
      where: { voucher_id: id },
      data: { status: false },
    });
  }

  // Lấy voucher đang active theo ngày hiện tại
  async findActive(): Promise<vouchers[]> {
    const today = new Date();
    return this.prisma.vouchers.findMany({
      where: {
        status: true,
        start_date: { lte: today },
        end_date: { gte: today },
      },
      orderBy: { voucher_id: 'asc' },
    });
  }
}
