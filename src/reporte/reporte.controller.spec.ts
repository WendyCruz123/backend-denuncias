import { Test, TestingModule } from '@nestjs/testing';
import { ReporteController } from './reporte.controller';

describe('ReporteController', () => {
  let controller: ReporteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReporteController],
    }).compile();

    controller = module.get<ReporteController>(ReporteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
