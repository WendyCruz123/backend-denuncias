import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EstadoController } from './estado.controller';
import { EstadoService } from './estado.service';

@Module({
  imports: [PrismaModule],
  controllers: [EstadoController],
  providers: [EstadoService],
  exports: [EstadoService],
})
export class EstadoModule {}