import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() dto: CreateReviewDto) {
    const userId = req.user.userId; // lấy từ JWT
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.reviewsService.createForUser(userId, dto);
  }

  @Public()
  @Get('product/:id')
  async findByProduct(@Param('id') id: string) {
    return this.reviewsService.findByProduct(Number(id));
  }
}
