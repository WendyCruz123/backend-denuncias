import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';

@Module({
  imports: [PrismaModule],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [ArchivoService],
})
export class ArchivoModule {}