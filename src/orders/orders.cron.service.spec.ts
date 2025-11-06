import { Test, TestingModule } from '@nestjs/testing';
import { OrdersCronService } from '../orders/orders.cron.service';

describe('OrdersCronService', () => {
  let service: OrdersCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersCronService],
    }).compile();

    service = module.get<OrdersCronService>(OrdersCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
