import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Customer } from '../users/entities/customer.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * Lấy tất cả địa chỉ của user
   */
  async getAddressByUserId(userId: number): Promise<Address[]> {
    const customer = await this.customerRepository.findOne({
      where: { user_id: userId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.addressRepository.find({
      where: {
        customer_id: customer.customer_id,
        status: true,
      },
      order: {
        is_default: 'DESC',
        created_at: 'DESC',
      },
    });
  }
}
