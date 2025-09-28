// src/cart/cart.controller.ts
import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly usersService: UsersService, // 👈 inject thêm
  ) {}

  @Get()
  async getCart(@Req() req) {
    const userId = req.user.userId || req.user.sub; // từ payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const customerId = await this.usersService.findCustomerIdByUserId(userId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.getCartByCustomer(customerId);
  }

  @Post('add')
  async addToCart(@Req() req, @Body() body: { variantId: number; quantity: number }) {
    const userId = req.user.userId || req.user.sub; // từ payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const customerId = await this.usersService.findCustomerIdByUserId(userId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.addToCart(customerId, body.variantId, body.quantity);
  }

  @Patch('update')
  async updateQuantity(@Req() req, @Body() body: { variantId: number; quantity: number }) {
    const userId = req.user.userId || req.user.sub; // từ payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const customerId = await this.usersService.findCustomerIdByUserId(userId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.updateQuantity(customerId, body.variantId, body.quantity);
  }

  @Delete('remove/:variantId')
  async removeFromCart(@Req() req, @Param('variantId') variantId: number) {
    const userId = req.user.userId || req.user.sub; // từ payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const customerId = await this.usersService.findCustomerIdByUserId(userId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.removeFromCart(customerId, variantId);
  }
}
