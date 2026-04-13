import { Test, TestingModule } from '@nestjs/testing';
import { SolucionService } from './solucion.service';

describe('SolucionService', () => {
  let service: SolucionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolucionService],
    }).compile();

    service = module.get<SolucionService>(SolucionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
