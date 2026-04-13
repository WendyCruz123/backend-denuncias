import { Test, TestingModule } from '@nestjs/testing';
import { DenunciaEstadoService } from './denuncia-estado.service';

describe('DenunciaEstadoService', () => {
  let service: DenunciaEstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DenunciaEstadoService],
    }).compile();

    service = module.get<DenunciaEstadoService>(DenunciaEstadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
