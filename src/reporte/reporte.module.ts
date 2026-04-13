import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReporteController } from './reporte.controller';
import { ReporteService } from './reporte.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReporteController],
  providers: [ReporteService],
  exports: [ReporteService],
})
export class ReporteModule {}