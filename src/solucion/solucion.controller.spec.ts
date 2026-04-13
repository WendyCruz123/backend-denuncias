import { Test, TestingModule } from '@nestjs/testing';
import { SolucionController } from './solucion.controller';

describe('SolucionController', () => {
  let controller: SolucionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolucionController],
    }).compile();

    controller = module.get<SolucionController>(SolucionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
