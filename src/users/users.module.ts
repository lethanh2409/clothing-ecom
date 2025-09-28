// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Customer } from './entities/customer.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Customer, UserRole, Role]),
    // CartModule, // BẮT BUỘC
  ],
  controllers: [UsersController],
  providers: [UsersService], // ⛔ KHÔNG thêm 'UserRepository' vào đây
  exports: [UsersService],
})
export class UsersModule {}
