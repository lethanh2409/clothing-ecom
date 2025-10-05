import { Controller, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './address.service';
// import { CreateAddressDto, UpdateAddressDto } from '../users/dtos/create-address.dto';

interface JwtUser {
  userId?: number;
  sub?: number;
  email?: string;
  roles?: string[];
}

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
    const userId = Number(req.user.userId || req.user.sub);
    return this.addressesService.getAddressByUserId(userId);
  }
}
