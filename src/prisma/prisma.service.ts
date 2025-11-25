import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // constructor() {
  //   // Tạo pg client
  //   const client = new pg.Client({
  //     connectionString: process.env.DATABASE_URL,
  //   });

  //   // Tạo adapter
  //   const adapter = new PrismaPg(client);

  //   // Gọi PrismaClient với adapter
  //   super({
  //     adapter,
  //   });

  //   // Kết nối pg client (bắt buộc)
  //   client.connect();
  // }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
