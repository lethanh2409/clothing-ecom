import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InventoryService } from './inventory.service';

@Injectable()
export class InventoryCron {
  constructor(private readonly inventoryService: InventoryService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailySnapshot() {
    await this.inventoryService.createSnapshot();
  }
}
