import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path as needed
import { addresses } from '@prisma/client'; // Generated type
import { CreateAddressDto } from './dtos/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAddressByUserId(userId: number): Promise<addresses[]> {
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.addresses.findMany({
      where: {
        customer_id: customer.customer_id,
        status: true,
      },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });
  }

  async createAddressForUser(userId: number, dto: CreateAddressDto) {
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
      select: { customer_id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // ✅ Kiểm tra trùng lặp: địa chỉ + người nhận + SĐT
      const duplicateAddress = await tx.addresses.findFirst({
        where: {
          customer_id: customer.customer_id,
          status: true,
          province: dto.province,
          district: dto.district,
          ward: dto.ward,
          street: dto.street ?? '',
          house_num: dto.house_num ?? '',
          consignee_name: dto.consignee_name,
          consignee_phone: dto.consignee_phone,
        },
      });

      if (duplicateAddress) {
        throw new ConflictException('Địa chỉ này với người nhận và số điện thoại đã tồn tại');
      }

      const addressCount = await tx.addresses.count({
        where: { customer_id: customer.customer_id, status: true },
      });

      const makeDefault = dto.is_default === true || addressCount === 0;

      if (makeDefault) {
        // bỏ default của các địa chỉ khác
        await tx.addresses.updateMany({
          where: { customer_id: customer.customer_id, is_default: true, status: true },
          data: { is_default: false },
        });
      }

      const created = await tx.addresses.create({
        data: {
          customer_id: customer.customer_id,
          consignee_name: dto.consignee_name,
          consignee_phone: dto.consignee_phone,
          province: dto.province,
          district: dto.district,
          ward: dto.ward,
          street: dto.street ?? '',
          house_num: dto.house_num ?? '',
          is_default: makeDefault,
          status: true,
        },
      });

      return created;
    });
  }
}
