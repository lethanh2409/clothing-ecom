// shipping.controller.ts
import { Controller, Get, Body, Query, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { Public } from 'src/auth/public.decorator';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // 1. API lấy Tỉnh/Thành phố
  @Get('provinces')
  async getProvinces() {
    try {
      return await this.shippingService.getProvinces();
    } catch (error: any) {
      throw new HttpException(error.message, error.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. API lấy Quận/Huyện
  @Get('districts')
  async getDistricts(@Query('province_id') provinceId: string) {
    try {
      if (!provinceId) {
        throw new HttpException('province_id là bắt buộc', HttpStatus.BAD_REQUEST);
      }
      return await this.shippingService.getDistricts(Number(provinceId));
    } catch (error: any) {
      throw new HttpException(error.message, error.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. API lấy Phường/Xã
  @Get('wards')
  async getWards(@Query('district_id') districtId: string) {
    try {
      if (!districtId) {
        throw new HttpException('district_id là bắt buộc', HttpStatus.BAD_REQUEST);
      }
      return await this.shippingService.getWards(Number(districtId));
    } catch (error: any) {
      throw new HttpException(error.message, error.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 4. API lấy loại vận chuyển
  @Get('services')
  async getAvailableServices(
    @Query('from_district') fromDistrict: string,
    @Query('to_district') toDistrict: string,
  ) {
    try {
      if (!fromDistrict || !toDistrict) {
        throw new HttpException('from_district và to_district là bắt buộc', HttpStatus.BAD_REQUEST);
      }
      return await this.shippingService.getAvailableServices(
        Number(fromDistrict),
        Number(toDistrict),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 5. API tính phí ship
  @Post('calculate-fee')
  async calculateShippingFee(
    @Body()
    body: {
      service_id: number;
      insurance_value?: number;
      coupon?: string;
      to_ward_code: string;
      to_district_id: number;
      from_district_id: number;
      weight: number;
      length: number;
      width: number;
      height: number;
    },
  ) {
    try {
      const params = {
        serviceId: 53321,
        insuranceValue: body.insurance_value || 0,
        couponValue: 0,
        toWardCode: body.to_ward_code,
        toDistrictId: body.to_district_id,
        fromDistrictId: body.from_district_id,
        weight: body.weight,
        length: body.length,
        width: body.width,
        height: body.height,
      };
      return await this.shippingService.calculateShippingFee(params);
    } catch (error: any) {
      throw new HttpException(error.message, error.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 6. API tính khoảng phí ship (min-max) với 2 kích thước
  @Public()
  @Post('calculate-shipping-range')
  async calculateShippingRange(
    @Body()
    body: {
      province_name: string;
      district_name: string;
      ward_name: string;
      from_district_id?: number;
      insurance_value?: number;
    },
  ) {
    try {
      const fromDistrictId = 3695; // Default shop district

      // Bước 1: Tìm province_id từ tên tỉnh
      const provinces = await this.shippingService.getProvinces();
      const province = provinces.data.find(
        (p: any) =>
          p.ProvinceName.toLowerCase().includes(body.province_name.toLowerCase()) ||
          p.NameExtension.some((name: string) =>
            name.toLowerCase().includes(body.province_name.toLowerCase()),
          ),
      );

      if (!province) {
        throw new HttpException('Không tìm thấy tỉnh/thành phố', HttpStatus.NOT_FOUND);
      }

      // Bước 2: Tìm district_id từ tên quận
      const districts = await this.shippingService.getDistricts(province.ProvinceID);
      const district = districts.data.find(
        (d: any) =>
          d.DistrictName.toLowerCase().includes(body.district_name.toLowerCase()) ||
          d.NameExtension.some((name: string) =>
            name.toLowerCase().includes(body.district_name.toLowerCase()),
          ),
      );

      if (!district) {
        throw new HttpException('Không tìm thấy quận/huyện', HttpStatus.NOT_FOUND);
      }

      // Bước 3: Tìm ward_code từ tên phường
      const wards = await this.shippingService.getWards(district.DistrictID);
      const ward = wards.data.find(
        (w: any) =>
          w.WardName.toLowerCase().includes(body.ward_name.toLowerCase()) ||
          w.NameExtension.some((name: string) =>
            name.toLowerCase().includes(body.ward_name.toLowerCase()),
          ),
      );

      if (!ward) {
        throw new HttpException('Không tìm thấy phường/xã', HttpStatus.NOT_FOUND);
      }

      // Bước 4: Lấy service_id
      const services = await this.shippingService.getAvailableServices(
        fromDistrictId,
        district.DistrictID,
      );

      if (!services.data || services.data.length === 0) {
        throw new HttpException('Không có dịch vụ vận chuyển khả dụng', HttpStatus.NOT_FOUND);
      }

      const serviceId = services.data[0].service_id;

      // Bước 5: Tính phí ship cho 2 kích thước
      const baseParams = {
        serviceId,
        toWardCode: ward.WardCode,
        toDistrictId: district.DistrictID,
        fromDistrictId,
        insuranceValue: body.insurance_value || 0,
        couponValue: 0,
      };

      // Kích thước nhỏ (1 áo)
      const minFee = await this.shippingService.calculateShippingFee({
        ...baseParams,
        weight: 300,
        length: 35,
        width: 30,
        height: 2,
      });

      // Kích thước lớn (3 áo)
      const maxFee = await this.shippingService.calculateShippingFee({
        ...baseParams,
        weight: 900,
        length: 35,
        width: 30,
        height: 10,
      });

      return {
        code: 200,
        message: 'Success',
        data: {
          min_shipping: {
            total: minFee.data.total,
            service_fee: minFee.data.service_fee,
            description: 'Phí ship cho 1 sản phẩm (300g, 35x30x2cm)',
          },
          max_shipping: {
            total: maxFee.data.total,
            service_fee: maxFee.data.service_fee,
            description: 'Phí ship cho 3 sản phẩm (900g, 35x30x10cm)',
          },
          range_text: `${minFee.data.total.toLocaleString('vi-VN')}đ - ${maxFee.data.total.toLocaleString('vi-VN')}đ`,
          address_info: {
            province_name: province.ProvinceName,
            district_name: district.DistrictName,
            ward_name: ward.WardName,
            service_id: serviceId,
          },
        },
      };
    } catch (error: any) {
      throw new HttpException(error.message, error.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
