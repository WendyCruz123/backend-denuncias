import { Test, TestingModule } from '@nestjs/testing';
import { ArchivoController } from './archivo.controller';

describe('ArchivoController', () => {
  let controller: ArchivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivoController],
    }).compile();

    controller = module.get<ArchivoController>(ArchivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
