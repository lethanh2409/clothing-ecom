import { Module } from '@nestjs/common';
import { AddressesController } from './address.controller';
import { AddressesService } from './address.service';

@Module({
  imports: [],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressModule {}
