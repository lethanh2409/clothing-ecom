import { Module } from '@nestjs/common';
import { LookbooksController } from './lookbooks.controller';
import { LookbooksService } from './lookbooks.service';

@Module({
  controllers: [LookbooksController],
  providers: [LookbooksService],
})
export class LookbooksModule {}
