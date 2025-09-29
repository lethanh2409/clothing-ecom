import { Test, TestingModule } from '@nestjs/testing';
import { LookbooksController } from './lookbooks.controller';

describe('LookbooksController', () => {
  let controller: LookbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LookbooksController],
    }).compile();

    controller = module.get<LookbooksController>(LookbooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
