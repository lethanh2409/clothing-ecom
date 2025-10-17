import { Module } from '@nestjs/common';
import { LookbooksController } from './lookbooks.controller';
import { LookbooksService } from './lookbooks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [LookbooksController],
  providers: [LookbooksService],
})
export class LookbooksModule {}
