// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import { CartModule } from 'src/cart/cart.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService], // ⛔ KHÔNG thêm 'UserRepository' vào đây
  exports: [UsersService],
})
export class UsersModule {}
