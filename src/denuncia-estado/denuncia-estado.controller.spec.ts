import { Test, TestingModule } from '@nestjs/testing';
import { DenunciaEstadoController } from './denuncia-estado.controller';

describe('DenunciaEstadoController', () => {
  let controller: DenunciaEstadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DenunciaEstadoController],
    }).compile();

    controller = module.get<DenunciaEstadoController>(DenunciaEstadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
