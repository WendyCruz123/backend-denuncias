import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SolucionController } from './solucion.controller';
import { SolucionService } from './solucion.service';

@Module({
  imports: [PrismaModule],
  controllers: [SolucionController],
  providers: [SolucionService],
  exports: [SolucionService],
})
export class SolucionModule {}