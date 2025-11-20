import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addresses } from '@prisma/client';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAddressById(userId: number, addressId: number) {
    return this.prisma.addresses.findFirst({
      where: {
        address_id: addressId,
        status: true,
        customers: { user_id: userId },
      },
    });
  }

  async getAddressByUserId(userId: number): Promise<addresses[]> {
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.addresses.findMany({
      where: { customer_id: customer.customer_id, status: true },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }, { address_id: 'asc' }],
    });
  }

  async createAddressForUser(userId: number, dto: CreateAddressDto) {
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
    });

    if (!customer) throw new Error('Customer not found');

    // Tìm địa chỉ trùng đã bị xóa
    const duplicated = await this.prisma.addresses.findFirst({
      where: {
        customer_id: customer.customer_id,
        status: false,
        consignee_name: dto.consignee_name,
        consignee_phone: dto.consignee_phone,
        house_num: dto.house_num,
        street: dto.street,
        ward_id: dto.ward_id,
        district_id: dto.district_id,
        province_id: dto.province_id,
      },
    });

    if (duplicated) {
      // Khôi phục địa chỉ
      return this.prisma.addresses.update({
        where: { address_id: duplicated.address_id },
        data: {
          ...dto,
          status: true,
          is_default: false,
        },
      });
    }

    // Check số lượng địa chỉ
    const count = await this.prisma.addresses.count({
      where: { customer_id: customer.customer_id, status: true },
    });

    const willBeDefault = count === 0 ? true : (dto.is_default ?? false);

    // Tạo mới
    const newAddress = await this.prisma.addresses.create({
      data: {
        customer_id: customer.customer_id,
        ...dto,
        is_default: willBeDefault,
      },
    });

    // Nếu set default = true → bỏ default của record khác
    if (willBeDefault && count > 0) {
      await this.prisma.addresses.updateMany({
        where: {
          customer_id: customer.customer_id,
          address_id: { not: newAddress.address_id },
        },
        data: { is_default: false },
      });
    }

    return newAddress;
  }

  async updateAddress(userId: number, addressId: number, dto: UpdateAddressDto) {
    // 1. Tìm customer
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // 2. Tìm address cần update
    const address = await this.prisma.addresses.findFirst({
      where: { address_id: addressId, customer_id: customer.customer_id },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // 3. Đếm tổng số địa chỉ active
    const total = await this.prisma.addresses.count({
      where: { customer_id: customer.customer_id, status: true },
    });

    // 4. Nếu chỉ có 1 địa chỉ → bắt buộc phải là default
    if (total === 1 && dto.is_default === false) {
      dto.is_default = true;
    }

    // 5. Nếu đặt địa chỉ này làm default → bỏ default các địa chỉ khác
    if (dto.is_default === true) {
      await this.prisma.addresses.updateMany({
        where: {
          customer_id: customer.customer_id,
          address_id: { not: addressId },
        },
        data: { is_default: false },
      });
    }

    // 6. Nếu bỏ default khỏi địa chỉ đang default → chuyển default sang địa chỉ khác
    if (address.is_default === true && dto.is_default === false) {
      const another = await this.prisma.addresses.findFirst({
        where: {
          customer_id: customer.customer_id,
          status: true,
          address_id: { not: addressId },
        },
        orderBy: { address_id: 'asc' },
      });

      if (another) {
        await this.prisma.addresses.update({
          where: { address_id: another.address_id },
          data: { is_default: true },
        });
      }
    }

    // 7. Cập nhật địa chỉ
    return this.prisma.addresses.update({
      where: { address_id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: number, addressId: number) {
    // 1. Tìm customer
    const customer = await this.prisma.customers.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // 2. Tìm address cần xóa
    const address = await this.prisma.addresses.findFirst({
      where: { address_id: addressId, customer_id: customer.customer_id },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // 3. Nếu địa chỉ đang là default → chuyển default sang địa chỉ khác trước khi xóa
    if (address.is_default) {
      const another = await this.prisma.addresses.findFirst({
        where: {
          customer_id: customer.customer_id,
          status: true,
          address_id: { not: addressId },
        },
        orderBy: { address_id: 'asc' },
      });

      if (another) {
        await this.prisma.addresses.update({
          where: { address_id: another.address_id },
          data: { is_default: true },
        });
      }
    }

    // 4. Soft delete địa chỉ
    await this.prisma.addresses.update({
      where: { address_id: addressId },
      data: { status: false, is_default: false },
    });

    return { deleted: true };
  }
}
