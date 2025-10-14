import {
  Controller,
  Get,
  Body,
  UseGuards,
  Request,
  Post,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './address.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from '../auth/roles.decorate';

// 👇 Quan trọng: dùng đúng loại Response/Request của EXPRESS
import express from 'express';

interface JwtUser {
  userId?: number;
  sub?: number;
  email?: string;
  roles?: string[];
}

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả địa chỉ của user' })
  @ApiResponse({ status: 200, description: 'Danh sách địa chỉ' })
  async getMyAddresses(@Request() req: { user: JwtUser }) {
    const userId = Number(req.user.userId ?? req.user.sub);
    return this.addressesService.getAddressByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('CUSTOMER')
  async create(
    // 👇 Gõ đúng kiểu Express Request và có field user
    @Req() req: express.Request & { user: JwtUser },
    @Body() dto: CreateAddressDto,
    // 👇 Dùng alias ExpressResponse để không đụng Response (DOM)
    @Res() res: express.Response,
  ): Promise<void> {
    const userId = Number(req.user.userId ?? req.user.sub);
    const address = await this.addressesService.createAddressForUser(userId, dto);

    const body: SuccessResponse<typeof address> = {
      success: true,
      message: 'Tạo địa chỉ thành công',
      data: address,
    };

    res.status(HttpStatus.CREATED).json(body); // OK: .status tồn tại trên ExpressResponse
  }
}
