import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RolUsuarioController } from './rol-usuario.controller';
import { RolUsuarioService } from './rol-usuario.service';

@Module({
  imports: [PrismaModule],
  controllers: [RolUsuarioController],
  providers: [RolUsuarioService],
  exports: [RolUsuarioService],
})
export class RolUsuarioModule {}