// src/cart/cart.controller.ts
import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.getCartByCustomer(req.user.sub);
  }

  @Post('add')
  addToCart(@Req() req, @Body() body: { variantId: number; quantity: number }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.addToCart(req.user.sub, body.variantId, body.quantity);
  }

  @Patch('update')
  updateQuantity(@Req() req, @Body() body: { variantId: number; quantity: number }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.updateQuantity(req.user.sub, body.variantId, body.quantity);
  }

  @Delete('remove/:variantId')
  removeFromCart(@Req() req, @Param('variantId') variantId: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.cartService.removeFromCart(req.user.sub, variantId);
  }
}
