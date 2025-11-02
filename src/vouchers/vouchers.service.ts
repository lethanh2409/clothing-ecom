// src/vouchers/vouchers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { vouchers } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { UpdateVoucherDto } from './dtos/update-voucher.dto';
import { VoucherResponseDto } from './dtos/voucher-response.dto';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function để format date
  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    return Number(value);
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
      2,
      '0',
    )}:${String(d.getSeconds()).padStart(2, '0')} ${String(d.getDate()).padStart(
      2,
      '0',
    )}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  private transformVoucher(voucher: vouchers): VoucherResponseDto {
    return {
      voucher_id: voucher.voucher_id,
      title: voucher.title,
      description: voucher.description,
      discount_type: voucher.discount_type,
      discount_value: this.toNumber(voucher.discount_value),
      min_order_value: this.toNumber(voucher.min_order_value),
      max_discount: this.toNumber(voucher.max_discount),
      quantity: voucher.quantity,
      used_count: voucher.used_count,
      per_customer_limit: voucher.per_customer_limit,
      start_date: voucher.start_date ? this.formatDate(voucher.start_date) : null,
      end_date: voucher.end_date ? this.formatDate(voucher.end_date) : null,
      status: voucher.status,
      created_at: this.formatDate(voucher.created_at),
      updated_at: this.formatDate(voucher.updated_at),
    };
  }

  async create(dto: CreateVoucherDto): Promise<VoucherResponseDto> {
    const voucher = await this.prisma.vouchers.create({
      data: {
        title: dto.title,
        description: dto.description,
        discount_type: dto.discount_type,
        discount_value: dto.discount_value,
        min_order_value: dto.min_order_value || 0,
        max_discount: dto.max_discount || 10000000,
        quantity: dto.quantity,
        used_count: 0,
        per_customer_limit: dto.per_customer_limit,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
        status: dto.status !== undefined ? dto.status : true,
      },
    });
    return this.transformVoucher(voucher);
  }

  async findAll(): Promise<VoucherResponseDto[]> {
    const vouchers = await this.prisma.vouchers.findMany();
    return vouchers.map((v) => this.transformVoucher(v));
  }

  async findOne(id: number): Promise<VoucherResponseDto> {
    const voucher = await this.prisma.vouchers.findUnique({
      where: { voucher_id: id },
    });
    if (!voucher) {
      throw new NotFoundException(`Voucher #${id} not found`);
    }
    return this.transformVoucher(voucher);
  }

  async update(id: number, dto: UpdateVoucherDto): Promise<VoucherResponseDto> {
    // Kiểm tra tồn tại
    const exists = await this.prisma.vouchers.findUnique({
      where: { voucher_id: id },
    });
    if (!exists) {
      throw new NotFoundException(`Voucher #${id} not found`);
    }

    // Update
    const voucher = await this.prisma.vouchers.update({
      where: { voucher_id: id },
      data: {
        title: dto.title,
        description: dto.description,
        discount_type: dto.discount_type,
        discount_value: dto.discount_value,
        min_order_value: dto.min_order_value,
        max_discount: dto.max_discount,
        quantity: dto.quantity,
        per_customer_limit: dto.per_customer_limit,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
        status: dto.status,
      },
    });
    return this.transformVoucher(voucher);
  }

  async remove(id: number): Promise<VoucherResponseDto> {
    // Kiểm tra tồn tại
    const exists = await this.prisma.vouchers.findUnique({
      where: { voucher_id: id },
    });
    if (!exists) {
      throw new NotFoundException(`Voucher #${id} not found`);
    }

    // Soft delete
    const voucher = await this.prisma.vouchers.update({
      where: { voucher_id: id },
      data: { status: false },
    });
    return this.transformVoucher(voucher);
  }

  async findActive(): Promise<VoucherResponseDto[]> {
    const today = new Date();
    const vouchers = await this.prisma.vouchers.findMany({
      where: {
        status: true,
        start_date: { lte: today },
        end_date: { gte: today },
      },
      orderBy: { voucher_id: 'asc' },
    });
    return vouchers.map((v) => this.transformVoucher(v));
  }
}
