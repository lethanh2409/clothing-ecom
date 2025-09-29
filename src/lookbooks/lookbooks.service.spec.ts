import { Test, TestingModule } from '@nestjs/testing';
import { LookbooksService } from './lookbooks.service';

describe('LookbooksService', () => {
  let service: LookbooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LookbooksService],
    }).compile();

    service = module.get<LookbooksService>(LookbooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
