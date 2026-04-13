import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriaModule {}