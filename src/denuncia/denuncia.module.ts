import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DenunciaController } from './denuncia.controller';
import { DenunciaService } from './denuncia.service';

@Module({
  imports: [PrismaModule],
  controllers: [DenunciaController],
  providers: [DenunciaService],
  exports: [DenunciaService],
})
export class DenunciaModule {}