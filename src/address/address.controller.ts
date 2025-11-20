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
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './address.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import express from 'express';
import { Roles } from '../auth/roles.decorate';
import { UpdateAddressDto } from './dtos/update-address.dto';

interface JwtUser {
  userId?: number;
  sub?: number;
}

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của user' })
  async getMyAddresses(@Request() req: { user: JwtUser }) {
    const userId = Number(req.user.userId ?? req.user.sub);
    return this.addressesService.getAddressByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin địa chỉ của user' })
  async getAddressesById(@Request() req: { user: JwtUser }, @Param('id') addressId: number) {
    const userId = Number(req.user.userId ?? req.user.sub);
    return this.addressesService.getAddressById(userId, addressId);
  }

  @Post()
  @Roles('CUSTOMER')
  async create(
    @Req() req: express.Request & { user: JwtUser },
    @Body() dto: CreateAddressDto,
    @Res() res: express.Response,
  ) {
    const userId = Number(req.user.userId ?? req.user.sub);
    const address = await this.addressesService.createAddressForUser(userId, dto);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Tạo địa chỉ thành công',
      data: address,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: express.Request & { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @Res() res: express.Response,
  ) {
    const userId = Number(req.user.userId ?? req.user.sub);

    const updated = await this.addressesService.updateAddress(userId, Number(id), dto);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data: updated,
    });
  }

  @Delete(':id')
  async delete(
    @Req() req: express.Request & { user: JwtUser },
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    const userId = Number(req.user.userId ?? req.user.sub);
    const result = await this.addressesService.deleteAddress(userId, Number(id));

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Xóa địa chỉ thành công',
      data: result,
    });
  }
}
