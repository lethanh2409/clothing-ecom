import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { UpdateVoucherDto } from './dtos/update-voucher.dto';
import { Roles } from 'src/auth/roles.decorate';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('vouchers')
@UseGuards(AuthGuard('jwt'), RolesGuard) // 👈 Áp dụng guard cho toàn bộ controller
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  // --- ADMIN CRUD ---

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.vouchersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(+id);
  }

  // --- CUSTOMER API ---
  @Get('active/list')
  @Roles('CUSTOMER', 'ADMIN') // customer & admin đều xem được
  async getActiveVouchers() {
    return this.vouchersService.findActive();
  }
}
