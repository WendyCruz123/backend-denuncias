import { Test, TestingModule } from '@nestjs/testing';
import { DenunciaService } from './denuncia.service';

describe('DenunciaService', () => {
  let service: DenunciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DenunciaService],
    }).compile();

    service = module.get<DenunciaService>(DenunciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
