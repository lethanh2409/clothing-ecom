import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  Body,
  Post,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorate';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { VnpayService } from '../payment/vnpay.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard) // áp cho toàn bộ controller
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly vnpayService: VnpayService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return {
      success: true,
      data: await this.ordersService.findAll(),
    };
  }

  // --- CUSTOMER: chỉ được xem đơn hàng của chính họ ---
  @Get('my-orders')
  @Roles('CUSTOMER') // chỉ customer mới call được
  async getOrdersByUser(@Req() req) {
    const userId = Number(req.user?.userId); // hoặc req.user?.userId tùy payload bạn sign
    console.log(req.user);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user id in token');
    }
    return this.ordersService.getOrdersByUserId(userId);
  }

  // --- ADMIN: xem đơn hàng của customer bất kỳ ---
  @Get('user-orders/:id')
  @Roles('ADMIN') // chỉ admin mới call được
  async getOrdersByUserId(@Param('id') id: string) {
    const userId = Number(id);
    console.log(userId);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user id param');
    }
    return this.ordersService.getOrdersByUserId(userId);
  }

  @Get(':id')
  @Roles('ADMIN')
  async getOrderById(@Param('id') id: number) {
    const order = await this.ordersService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  @Post()
  @Roles('CUSTOMER')
  async create(@Body() dto: CreateOrderDto, @Req() req) {
    const userId = Number(req.user?.userId); // hoặc req.user?.userId tùy payload bạn sign
    // Tìm customer_id từ user_id
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
      select: { customer_id: true },
    });

    if (!customer) {
      throw new ForbiddenException('Tài khoản này không có hồ sơ khách hàng.');
    }

    return this.ordersService.createOrder(dto, customer.customer_id);
  }

  @Post(':id/pay')
  @Roles('CUSTOMER')
  async retryPayment(@Param('id') id: string) {
    return this.vnpayService.retryPayment(Number(id));
  }
}
