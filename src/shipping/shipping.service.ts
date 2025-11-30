// shipping.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShippingService {
  private readonly baseURL =
    process.env.GHN_BASE_URL || 'https://online-gateway.ghn.vn/shiip/public-api';
  private readonly token = process.env.GHN_TOKEN || '7aae3204-c5b3-11f0-a0b9-a6fd7d3828f8';
  private readonly shopId = process.env.GHN_SHOP_ID || '6124120';

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      token: this.token,
    };
  }

  private async request(method: string, endpoint: string, data?: any, params?: any): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(),
      };

      if (data) {
        config.data = data;
      }

      if (params) {
        config.params = params;
      }

      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw {
        code: error.response?.data?.code || 500,
        message: error.response?.data?.message || 'Lỗi kết nối với GHN',
        data: error.response?.data?.data || null,
      };
    }
  }

  // 1. API lấy Tỉnh/Thành phố
  async getProvinces(): Promise<any> {
    return await this.request('GET', '/master-data/province');
  }

  // 2. API lấy Quận/Huyện
  async getDistricts(provinceId: number): Promise<any> {
    return await this.request('GET', '/master-data/district', null, {
      province_id: provinceId,
    });
  }

  // 3. API lấy Phường/Xã
  async getWards(districtId: number): Promise<any> {
    return await this.request('GET', '/master-data/ward', null, {
      district_id: districtId,
    });
  }

  // 4. API lấy loại vận chuyển
  async getAvailableServices(fromDistrict: number, toDistrict: number): Promise<any> {
    return await this.request('GET', '/v2/shipping-order/available-services', null, {
      shop_id: this.shopId,
      from_district: fromDistrict,
      to_district: toDistrict,
    });
  }

  // 5. API tính phí ship
  async calculateShippingFee(params: {
    serviceId: number;
    toWardCode: string;
    toDistrictId: number;
    fromDistrictId: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    insuranceValue?: number;
    couponValue?: number;
  }): Promise<any> {
    const {
      serviceId,
      toWardCode,
      toDistrictId,
      fromDistrictId,
      weight,
      length,
      width,
      height,
      insuranceValue = 0,
      couponValue = 0,
    } = params;

    return await this.request('POST', '/v2/shipping-order/fee', {
      service_id: serviceId,
      insurance_value: insuranceValue,
      coupon: couponValue || null,
      from_district_id: fromDistrictId,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      height,
      length,
      weight,
      width,
    });
  }
}
