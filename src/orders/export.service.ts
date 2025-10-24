// src/orders/export.service.ts
import { Injectable } from '@nestjs/common';
import { OrdersService } from './orders.service';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';

@Injectable()
export class ExportService {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Export doanh thu theo tháng ra Excel
   */
  async exportMonthlyRevenueExcel(year: number): Promise<Buffer> {
    const data = await this.ordersService.getYearlyStatistics(year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Doanh Thu ${year}`);

    // Header
    worksheet.columns = [
      { header: 'Tháng', key: 'month', width: 10 },
      { header: 'Tên Tháng', key: 'monthName', width: 15 },
      { header: 'Doanh Thu', key: 'revenue', width: 20 },
      { header: 'Phí Ship', key: 'shipping', width: 15 },
      { header: 'Số Đơn', key: 'orderCount', width: 12 },
      { header: 'Giá Trị TB', key: 'averageOrderValue', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    data.monthlyData.forEach((row) => {
      worksheet.addRow({
        month: row.month,
        monthName: row.monthName,
        revenue: row.revenue,
        shipping: row.shipping,
        orderCount: row.orderCount,
        averageOrderValue: row.averageOrderValue,
      });
    });

    // Format currency columns
    worksheet.getColumn('revenue').numFmt = '#,##0';
    worksheet.getColumn('shipping').numFmt = '#,##0';
    worksheet.getColumn('averageOrderValue').numFmt = '#,##0';

    // Add summary row
    const summaryRow = worksheet.addRow({
      month: '',
      monthName: 'TỔNG CỘNG',
      revenue: data.totalRevenue,
      shipping: data.monthlyData.reduce((sum, m) => sum + m.shipping, 0),
      orderCount: data.totalOrders,
      averageOrderValue: data.totalRevenue / data.totalOrders,
    });
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export top sản phẩm ra Excel
   */
  async exportTopProductsExcel(limit: number, month?: number, year?: number): Promise<Buffer> {
    const data = await this.ordersService.getTopProducts(limit, month, year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Top Sản Phẩm');

    // Header
    worksheet.columns = [
      { header: 'Hạng', key: 'rank', width: 8 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Tên Sản Phẩm', key: 'product_name', width: 30 },
      { header: 'Thương Hiệu', key: 'brand', width: 15 },
      { header: 'Danh Mục', key: 'category', width: 20 },
      { header: 'Số Lượng Bán', key: 'totalQuantity', width: 15 },
      { header: 'Doanh Thu', key: 'totalRevenue', width: 20 },
      { header: 'Số Đơn', key: 'orderCount', width: 12 },
      { header: 'Giá TB', key: 'averagePrice', width: 15 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    data.products.forEach((product) => {
      worksheet.addRow({
        rank: product.rank,
        sku: product.sku,
        product_name: product.product_name,
        brand: product.brand,
        category: product.category,
        totalQuantity: product.totalQuantity,
        totalRevenue: product.totalRevenue,
        orderCount: product.orderCount,
        averagePrice: product.averagePrice,
      });
    });

    // Format currency columns
    worksheet.getColumn('totalRevenue').numFmt = '#,##0';
    worksheet.getColumn('averagePrice').numFmt = '#,##0';

    // Add period info
    worksheet.addRow({});
    const infoRow = worksheet.addRow({
      rank: '',
      sku: 'Kỳ báo cáo:',
      product_name: data.period,
    });
    infoRow.font = { italic: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export doanh thu theo category ra Excel
   */
  async exportCategoryRevenueExcel(month?: number, year?: number): Promise<Buffer> {
    const data = await this.ordersService.getRevenueByCategory(month, year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Doanh Thu Theo Danh Mục');

    // Header
    worksheet.columns = [
      { header: 'Danh Mục', key: 'category_name', width: 30 },
      { header: 'Doanh Thu', key: 'totalRevenue', width: 20 },
      { header: 'Tỷ Trọng (%)', key: 'percentage', width: 15 },
      { header: 'Số Lượng', key: 'totalQuantity', width: 15 },
      { header: 'Số Đơn', key: 'orderCount', width: 12 },
      { header: 'Giá Trị TB', key: 'averageOrderValue', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    data.categories.forEach((cat) => {
      worksheet.addRow({
        category_name: cat.category_name,
        totalRevenue: cat.totalRevenue,
        percentage: cat.percentage,
        totalQuantity: cat.totalQuantity,
        orderCount: cat.orderCount,
        averageOrderValue: cat.averageOrderValue,
      });
    });

    // Format columns
    worksheet.getColumn('totalRevenue').numFmt = '#,##0';
    worksheet.getColumn('percentage').numFmt = '0.00';
    worksheet.getColumn('averageOrderValue').numFmt = '#,##0';

    // Add summary
    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      category_name: 'TỔNG CỘNG',
      totalRevenue: data.totalRevenue,
      percentage: 100,
      totalQuantity: data.categories.reduce((sum, c) => sum + c.totalQuantity, 0),
      orderCount: data.categories.reduce((sum, c) => sum + c.orderCount, 0),
      averageOrderValue: '',
    });
    summaryRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export doanh thu theo brand ra Excel
   */
  async exportBrandRevenueExcel(month?: number, year?: number): Promise<Buffer> {
    const data = await this.ordersService.getRevenueByBrand(month, year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Doanh Thu Theo Thương Hiệu');

    // Header
    worksheet.columns = [
      { header: 'Thương Hiệu', key: 'brand_name', width: 25 },
      { header: 'Doanh Thu', key: 'totalRevenue', width: 20 },
      { header: 'Tỷ Trọng (%)', key: 'percentage', width: 15 },
      { header: 'Số Lượng', key: 'totalQuantity', width: 15 },
      { header: 'Số Đơn', key: 'orderCount', width: 12 },
      { header: 'Giá Trị TB', key: 'averageOrderValue', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    data.brands.forEach((brand) => {
      worksheet.addRow({
        brand_name: brand.brand_name,
        totalRevenue: brand.totalRevenue,
        percentage: brand.percentage,
        totalQuantity: brand.totalQuantity,
        orderCount: brand.orderCount,
        averageOrderValue: brand.averageOrderValue,
      });
    });

    // Format columns
    worksheet.getColumn('totalRevenue').numFmt = '#,##0';
    worksheet.getColumn('percentage').numFmt = '0.00';
    worksheet.getColumn('averageOrderValue').numFmt = '#,##0';

    // Add summary
    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      brand_name: 'TỔNG CỘNG',
      totalRevenue: data.totalRevenue,
      percentage: 100,
      totalQuantity: data.brands.reduce((sum, b) => sum + b.totalQuantity, 0),
      orderCount: data.brands.reduce((sum, b) => sum + b.orderCount, 0),
      averageOrderValue: '',
    });
    summaryRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export tất cả báo cáo theo năm vào 1 file Excel với nhiều sheets
   */
  async exportCompleteYearReport(year: number): Promise<Buffer> {
    const [monthlyStats, topProducts, categoryStats, brandStats] = await Promise.all([
      this.ordersService.getYearlyStatistics(year),
      this.ordersService.getTopProducts(20, undefined, year),
      this.ordersService.getRevenueByCategory(undefined, year),
      this.ordersService.getRevenueByBrand(undefined, year),
    ]);

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Tổng quan
    const overviewSheet = workbook.addWorksheet('Tổng Quan');
    overviewSheet.addRow(['BÁO CÁO DOANH THU NĂM ' + year]);
    overviewSheet.getRow(1).font = { size: 16, bold: true };
    overviewSheet.addRow([]);
    overviewSheet.addRow(['Tổng doanh thu:', monthlyStats.totalRevenue]);
    overviewSheet.addRow(['Tổng số đơn:', monthlyStats.totalOrders]);
    overviewSheet.addRow(['Doanh thu TB/tháng:', monthlyStats.averageMonthlyRevenue]);
    overviewSheet.addRow(['Ngày xuất báo cáo:', format(new Date(), 'dd/MM/yyyy HH:mm:ss')]);

    // Sheet 2: Doanh thu theo tháng
    const monthlySheet = workbook.addWorksheet('Theo Tháng');
    monthlySheet.columns = [
      { header: 'Tháng', key: 'month', width: 10 },
      { header: 'Doanh Thu', key: 'revenue', width: 20 },
      { header: 'Số Đơn', key: 'orderCount', width: 12 },
      { header: 'Giá Trị TB', key: 'avg', width: 20 },
    ];
    monthlySheet.getRow(1).font = { bold: true };
    monthlyStats.monthlyData.forEach((m) => {
      monthlySheet.addRow({
        month: m.monthName,
        revenue: m.revenue,
        orderCount: m.orderCount,
        avg: m.averageOrderValue,
      });
    });

    // Sheet 3: Top sản phẩm
    const productsSheet = workbook.addWorksheet('Top Sản Phẩm');
    productsSheet.columns = [
      { header: 'Hạng', key: 'rank', width: 8 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Sản Phẩm', key: 'name', width: 30 },
      { header: 'Thương Hiệu', key: 'brand', width: 15 },
      { header: 'SL Bán', key: 'qty', width: 12 },
      { header: 'Doanh Thu', key: 'revenue', width: 20 },
    ];
    productsSheet.getRow(1).font = { bold: true };
    topProducts.products.forEach((p) => {
      productsSheet.addRow({
        rank: p.rank,
        sku: p.sku,
        name: p.product_name,
        brand: p.brand,
        qty: p.totalQuantity,
        revenue: p.totalRevenue,
      });
    });

    // Sheet 4: Theo danh mục
    const categorySheet = workbook.addWorksheet('Theo Danh Mục');
    categorySheet.columns = [
      { header: 'Danh Mục', key: 'name', width: 30 },
      { header: 'Doanh Thu', key: 'revenue', width: 20 },
      { header: 'Tỷ Trọng (%)', key: 'percent', width: 15 },
      { header: 'Số Lượng', key: 'qty', width: 12 },
    ];
    categorySheet.getRow(1).font = { bold: true };
    categoryStats.categories.forEach((c) => {
      categorySheet.addRow({
        name: c.category_name,
        revenue: c.totalRevenue,
        percent: c.percentage,
        qty: c.totalQuantity,
      });
    });

    // Sheet 5: Theo thương hiệu
    const brandSheet = workbook.addWorksheet('Theo Thương Hiệu');
    brandSheet.columns = [
      { header: 'Thương Hiệu', key: 'name', width: 25 },
      { header: 'Doanh Thu', key: 'revenue', width: 20 },
      { header: 'Tỷ Trọng (%)', key: 'percent', width: 15 },
      { header: 'Số Lượng', key: 'qty', width: 12 },
    ];
    brandSheet.getRow(1).font = { bold: true };
    brandStats.brands.forEach((b) => {
      brandSheet.addRow({
        name: b.brand_name,
        revenue: b.totalRevenue,
        percent: b.percentage,
        qty: b.totalQuantity,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export ra CSV (dạng đơn giản)
   */
  async exportMonthlyRevenueCSV(year: number): Promise<string> {
    const data = await this.ordersService.getYearlyStatistics(year);

    let csv = 'Tháng,Tên Tháng,Doanh Thu,Phí Ship,Số Đơn,Giá Trị TB\n';

    data.monthlyData.forEach((row) => {
      csv += `${row.month},${row.monthName},${row.revenue},${row.shipping},${row.orderCount},${row.averageOrderValue}\n`;
    });

    csv += `\nTổng Cộng,,${data.totalRevenue},,${data.totalOrders},${data.averageMonthlyRevenue}\n`;

    return csv;
  }
}
