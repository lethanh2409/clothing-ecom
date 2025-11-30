// src/orders/orders.controller.ts
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
  Query,
  Res,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import express from 'express'; // FIX: Import Response from express
import { OrdersService } from './orders.service';
import { Roles } from '../auth/roles.decorate';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { VnpayService } from '../payment/vnpay.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExportService } from './export.service';
import {
  RevenueQueryDto,
  TopProductsQueryDto,
  RevenueByCategoryQueryDto,
  RevenueByBrandQueryDto,
} from './dtos/revenue-query.dto';
import { UpdateOrderStatusDto } from './dtos/update-order-status';
import { Public } from 'src/auth/public.decorator';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly vnpayService: VnpayService,
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return {
      success: true,
      data: await this.ordersService.findAll(),
    };
  }

  @Public()
  @Get('/:id/AI/:userId')
  async getOrderForAI(@Param('id') id: string, @Param('userId') userId: string) {
    const order = await this.ordersService.getOrderByIdForAI(Number(id), Number(userId));
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  // --- CUSTOMER: chỉ được xem đơn hàng của chính họ ---
  @Get('my-orders')
  @Roles('CUSTOMER')
  async getOrdersByUser(@Req() req: any) {
    const userId = Number(req.user?.userId);
    console.log(req.user);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user id in token');
    }
    return this.ordersService.getOrdersByUserId(userId);
  }

  // --- ADMIN: xem đơn hàng của customer bất kỳ ---
  @Get('user-orders/:id')
  @Roles('ADMIN')
  async getOrdersByUserId(@Param('id') id: string) {
    const userId = Number(id);
    console.log(userId);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user id param');
    }
    return this.ordersService.getOrdersByUserId(userId);
  }

  @Post()
  @Roles('CUSTOMER')
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const userId = Number(req.user?.userId);
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
      select: { customer_id: true },
    });

    if (!customer) {
      throw new ForbiddenException('Tài khoản này không có hồ sơ khách hàng.');
    }

    return this.ordersService.createOrder(dto, customer.customer_id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF') // Chỉ admin/staff mới được cập nhật
  async updateOrderStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user?.userId);
    return this.ordersService.updateOrderStatus(orderId, dto, userId);
  }

  @Get(':id/history')
  @Roles('ADMIN', 'STAFF')
  async getOrderStatusHistory(@Param('id', ParseIntPipe) orderId: number) {
    return this.ordersService.getOrderStatusHistory(orderId);
  }

  // ==================== THANH TOÁN LẠI VNPAY ====================
  @Post(':id/repay')
  @Roles('CUSTOMER')
  async retryPayment(@Param('id') id: string) {
    return this.vnpayService.retryPayment(Number(id));
  }

  // ==================== THỐNG KÊ DOANH THU ====================

  /**
   * GET /orders/revenue/dashboard
   * Tổng quan dashboard - dành cho admin
   */
  @Get('revenue/dashboard')
  @Roles('ADMIN')
  async getDashboard() {
    const data = await this.ordersService.getDashboardOverview();
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /orders/revenue/monthly?month=1&year=2025
   * Doanh thu theo tháng cụ thể
   */
  @Get('revenue/monthly')
  @Roles('ADMIN')
  async getMonthlyRevenue(@Query() query: RevenueQueryDto) {
    const now = new Date();
    const month = query.month || now.getMonth() + 1;
    const year = query.year || now.getFullYear();

    const data = await this.ordersService.getRevenueByMonth(month, year);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /orders/revenue/yearly?year=2025
   * Doanh thu theo năm
   */
  @Get('revenue/yearly')
  @Roles('ADMIN')
  async getYearlyRevenue(@Query() query: RevenueQueryDto) {
    const year = query.year || new Date().getFullYear();

    const data = await this.ordersService.getRevenueByYear(year);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /orders/revenue/statistics?year=2025
   * Thống kê 12 tháng trong năm
   */
  @Get('revenue/statistics')
  @Roles('ADMIN')
  async getYearlyStatistics(@Query() query: RevenueQueryDto) {
    const year = query.year || new Date().getFullYear();

    const data = await this.ordersService.getYearlyStatistics(year);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /orders/revenue/top-products?limit=10&month=1&year=2025
   * Top sản phẩm bán chạy
   */
  @Get('revenue/top-products')
  @Roles('ADMIN')
  async getTopProducts(@Query() query: TopProductsQueryDto) {
    const limit = query.limit || 10;
    const data = await this.ordersService.getTopProducts(limit, query.month, query.year);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /orders/revenue/by-category?month=1&year=2025
   * Doanh thu theo category
   */
  @Get('revenue/by-category')
  @Roles('ADMIN')
  async getRevenueByCategory(@Query() query: RevenueByCategoryQueryDto) {
    const data = await this.ordersService.getRevenueByCategory(query.month, query.year);
    return {
      success: true,
      data,
    };
  }

  /**
   * GET /orders/revenue/by-brand?month=1&year=2025
   * Doanh thu theo brand
   */
  @Get('revenue/by-brand')
  @Roles('ADMIN')
  async getRevenueByBrand(@Query() query: RevenueByBrandQueryDto) {
    const data = await this.ordersService.getRevenueByBrand(query.month, query.year);
    return {
      success: true,
      data,
    };
  }

  // Thêm vào orders.controller.ts
  @Get('revenue/date-range')
  @Roles('ADMIN')
  async getRevenueByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate và endDate là bắt buộc');
    }
    return this.ordersService.getRevenueByDateRange(new Date(startDate), new Date(endDate));
  }

  /**
   * 2️⃣ Thống kê chi tiết theo ngày
   * GET /orders/statistics/daily?startDate=2024-12-01&endDate=2025-01-30
   */
  @Get('daily')
  @Roles('ADMIN')
  async getDailyStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate và endDate là bắt buộc');
    }
    return this.ordersService.getRevenueByDateRange(new Date(startDate), new Date(endDate));
  }

  /**
   * 3️⃣ Top sản phẩm bán chạy
   * GET /orders/statistics/top-products/date-range?startDate=2024-12-01&endDate=2025-01-30&limit=10
   */
  @Get('top-products/date-range')
  @Roles('ADMIN')
  async getTopProductsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate và endDate là bắt buộc');
    }
    const limitNum = limit ? parseInt(limit) : 10;
    return this.ordersService.getTopProductsByDateRange(
      new Date(startDate),
      new Date(endDate),
      limitNum,
    );
  }

  /**
   * 4️⃣ Doanh thu theo danh mục
   * GET /orders/statistics/category/date-range?startDate=2024-12-01&endDate=2025-01-30
   */
  @Get('category/date-range')
  @Roles('ADMIN')
  async getRevenueByCategoryDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate và endDate là bắt buộc');
    }
    return this.ordersService.getRevenueByCategoryDateRange(new Date(startDate), new Date(endDate));
  }

  /**
   * 5️⃣ Doanh thu theo thương hiệu
   * GET /orders/statistics/brand/date-range?startDate=2024-12-01&endDate=2025-01-30
   */
  @Get('brand/date-range')
  @Roles('ADMIN')
  async getRevenueByBrandDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate và endDate là bắt buộc');
    }
    return this.ordersService.getRevenueByBrandDateRange(new Date(startDate), new Date(endDate));
  }

  // ==================== EXPORT EXCEL/CSV ====================

  /**
   * GET /orders/export/monthly-revenue-excel?year=2025
   * Export doanh thu theo tháng ra Excel
   */
  @Get('export/monthly-revenue-excel')
  @Roles('ADMIN')
  async exportMonthlyRevenueExcel(@Query() query: RevenueQueryDto, @Res() res: express.Response) {
    const year = query.year || new Date().getFullYear();
    const buffer = await this.exportService.exportMonthlyRevenueExcel(year);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="doanh-thu-thang-${year}.xlsx"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  /**
   * GET /orders/export/top-products-excel?limit=20&month=1&year=2025
   * Export top sản phẩm ra Excel
   */
  @Get('export/top-products-excel')
  @Roles('ADMIN')
  async exportTopProductsExcel(@Query() query: TopProductsQueryDto, @Res() res: express.Response) {
    const limit = query.limit || 20;
    const buffer = await this.exportService.exportTopProductsExcel(limit, query.month, query.year);

    const filename = query.month
      ? `top-san-pham-${query.month}-${query.year}.xlsx`
      : `top-san-pham-${query.year || 'all'}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  /**
   * GET /orders/export/category-revenue-excel?month=1&year=2025
   * Export doanh thu theo category ra Excel
   */
  @Get('export/category-revenue-excel')
  @Roles('ADMIN')
  async exportCategoryRevenueExcel(
    @Query() query: RevenueByCategoryQueryDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportService.exportCategoryRevenueExcel(query.month, query.year);

    const filename = query.month
      ? `doanh-thu-danh-muc-${query.month}-${query.year}.xlsx`
      : `doanh-thu-danh-muc-${query.year || 'all'}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  /**
   * GET /orders/export/brand-revenue-excel?month=1&year=2025
   * Export doanh thu theo brand ra Excel
   */
  @Get('export/brand-revenue-excel')
  @Roles('ADMIN')
  async exportBrandRevenueExcel(
    @Query() query: RevenueByBrandQueryDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportService.exportBrandRevenueExcel(query.month, query.year);

    const filename = query.month
      ? `doanh-thu-thuong-hieu-${query.month}-${query.year}.xlsx`
      : `doanh-thu-thuong-hieu-${query.year || 'all'}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  /**
   * GET /orders/export/complete-year-report?year=2025
   * Export báo cáo tổng hợp cả năm (nhiều sheets)
   */
  @Get('export/complete-year-report')
  @Roles('ADMIN')
  async exportCompleteYearReport(@Query() query: RevenueQueryDto, @Res() res: express.Response) {
    const year = query.year || new Date().getFullYear();
    const buffer = await this.exportService.exportCompleteYearReport(year);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="bao-cao-tong-hop-${year}.xlsx"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  /**
   * GET /orders/export/monthly-revenue-csv?year=2025
   * Export doanh thu theo tháng ra CSV
   */
  @Get('export/monthly-revenue-csv')
  @Roles('ADMIN')
  async exportMonthlyRevenueCSV(@Query() query: RevenueQueryDto, @Res() res: express.Response) {
    const year = query.year || new Date().getFullYear();
    const csv = await this.exportService.exportMonthlyRevenueCSV(year);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="doanh-thu-thang-${year}.csv"`,
    });

    // Thêm BOM để Excel đọc đúng tiếng Việt
    res.send('\uFEFF' + csv);
  }

  @Get(':id')
  @Roles('ADMIN')
  async getOrderById(@Param('id') id: string) {
    const order = await this.ordersService.getOrderById(Number(id));
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }
}
