import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('db')
  async checkDB() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        success: true,
        message: '✅ Database connected',
      };
    } catch (e) {
      return {
        success: false,
        message: '❌ Database not connected',
        error: e.message,
      };
    }
  }
}
