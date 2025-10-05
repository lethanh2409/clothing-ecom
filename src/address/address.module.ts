import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesController } from './address.controller';
import { AddressesService } from './address.service';
import { Address } from './entities/address.entity';
import { Customer } from '../users/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Customer])],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressModule {}
