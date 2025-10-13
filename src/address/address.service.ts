import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path as needed
import { addresses } from '@prisma/client'; // Generated type

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
}
