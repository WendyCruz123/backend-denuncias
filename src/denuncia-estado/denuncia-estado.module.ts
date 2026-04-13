import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DenunciaEstadoController } from './denuncia-estado.controller';
import { DenunciaEstadoService } from './denuncia-estado.service';

@Module({
  imports: [PrismaModule],
  controllers: [DenunciaEstadoController],
  providers: [DenunciaEstadoService],
  exports: [DenunciaEstadoService],
})
export class DenunciaEstadoModule {}