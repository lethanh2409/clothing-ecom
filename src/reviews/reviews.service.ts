import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { format } from 'date-fns';
import { Prisma } from '@prisma/client';

// Define the exact type of what findMany returns
type ReviewWithRelations = Prisma.reviewsGetPayload<{
  include: {
    customers: {
      include: {
        users: {
          select: { full_name: true };
        };
      };
    };
    order_detail: {
      include: {
        product_variants: {
          include: {
            products: { select: { product_name: true } };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Nhận userId, tự tìm customerId và kiểm tra quyền sở hữu order_detail
  async createForUser(userId: number, dto: CreateReviewDto) {
    // 1) Tìm customer từ user
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
      select: { customer_id: true },
    });
    if (!customer) {
      throw new ForbiddenException('Tài khoản này chưa có hồ sơ khách hàng.');
    }

    // 2) Kiểm tra order_detail có thuộc đơn của customer không
    const od = await this.prisma.order_detail.findUnique({
      where: { order_detail_id: dto.orderDetailId },
      select: {
        order_id: true,
        orders: { select: { customer_id: true, order_status: true, payment_status: true } },
      },
    });
    if (!od || od.orders.customer_id !== customer.customer_id) {
      throw new ForbiddenException('Bạn không thể đánh giá sản phẩm không thuộc đơn hàng của bạn.');
    }

    // (khuyến nghị) chỉ cho review khi đã hoàn tất/đã thanh toán
    if (!(od.orders.order_status === 'completed' || od.orders.payment_status === 'paid')) {
      throw new BadRequestException('Đơn hàng chưa hoàn tất nên chưa thể đánh giá.');
    }

    // 3) Tránh review trùng
    const existed = await this.prisma.reviews.findFirst({
      where: { order_detail_id: dto.orderDetailId, customer_id: customer.customer_id },
      select: { review_id: true },
    });
    if (existed) throw new BadRequestException('Bạn đã đánh giá mục này rồi.');

    // 4) Tạo review
    const review = await this.prisma.reviews.create({
      data: {
        customer_id: customer.customer_id,
        order_detail_id: dto.orderDetailId,
        rating: dto.rating,
        comment: dto.comment,
        image: dto.image,
      },
      include: {
        customers: { include: { users: { select: { full_name: true } } } },
        order_detail: {
          include: {
            product_variants: {
              include: { products: { select: { product_name: true } } },
            },
          },
        },
      },
    });

    // dùng lại transformReview
    return this.transformReview(review);
  }

  async findByProduct(productId: number) {
    const reviews = await this.prisma.reviews.findMany({
      where: {
        order_detail: {
          product_variants: {
            product_id: productId,
          },
        },
      },
      include: {
        customers: {
          include: {
            users: {
              select: { full_name: true },
            },
          },
        },
        order_detail: {
          include: {
            product_variants: {
              include: {
                products: { select: { product_name: true } },
              },
            },
          },
        },
      },
    });

    return reviews.map((review) => this.transformReview(review));
  }

  private transformReview(review: ReviewWithRelations) {
    return {
      ...review,
      created_at: this.formatDate(review.created_at),
      updated_at: this.formatDate(review.updated_at),
      customers: {
        ...review.customers,
        birthday: review.customers.birthday ? this.formatDate(review.customers.birthday) : null,
        created_at: this.formatDate(review.customers.created_at),
        updated_at: this.formatDate(review.customers.updated_at),
      },
      order_detail: {
        ...review.order_detail,
        total_price: Number(review.order_detail.total_price),
        discount_price: Number(review.order_detail.discount_price),
        product_variants: {
          ...review.order_detail.product_variants,
          cost_price: review.order_detail.product_variants.cost_price
            ? Number(review.order_detail.product_variants.cost_price)
            : null,
          base_price: review.order_detail.product_variants.base_price
            ? Number(review.order_detail.product_variants.base_price)
            : null,
          created_at: this.formatDate(review.order_detail.product_variants.created_at),
          updated_at: this.formatDate(review.order_detail.product_variants.updated_at),
        },
      },
    };
  }

  private formatDate(date: Date | string): string {
    return format(new Date(date), 'hh:mm:ss dd/MM/yyyy');
  }
}
