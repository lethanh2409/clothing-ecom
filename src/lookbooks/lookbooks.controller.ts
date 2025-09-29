import { Controller, Get, Param } from '@nestjs/common';
import { LookbooksService } from './lookbooks.service';

@Controller('lookbooks')
export class LookbooksController {
  constructor(private readonly lookbooksService: LookbooksService) {}

  @Get()
  getAll() {
    return this.lookbooksService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.lookbooksService.getOne(+id);
  }

  @Get(':id/items')
  getItems(@Param('id') id: string) {
    return this.lookbooksService.getItems(+id);
  }
}
