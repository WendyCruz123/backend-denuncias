import { Test, TestingModule } from '@nestjs/testing';
import { DenunciaController } from './denuncia.controller';

describe('DenunciaController', () => {
  let controller: DenunciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DenunciaController],
    }).compile();

    controller = module.get<DenunciaController>(DenunciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
