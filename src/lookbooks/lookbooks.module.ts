import { Module } from '@nestjs/common';
import { LookbooksController } from './lookbooks.controller';
import { LookbooksService } from './lookbooks.service';
import { Lookbook } from './entities/lookbook.entity';
import { LookbookItem } from './entities/lookbook_items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Lookbook, LookbookItem])],
  controllers: [LookbooksController],
  providers: [LookbooksService],
})
export class LookbooksModule {}
