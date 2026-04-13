import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DenunciaEstadoService } from './denuncia-estado.service';
import { CreateDenunciaEstadoDto } from './dto/create-denuncia-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('denuncia-estado')
export class DenunciaEstadoController {
  constructor(private readonly service: DenunciaEstadoService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'FUNCIONARIO')
  @Post()
  cambiarEstado(@Body() dto: CreateDenunciaEstadoDto, @Req() req: any) {
    return this.service.cambiarEstado(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get('historial/:denunciaId')
  findHistorialByDenuncia(@Param('denunciaId') denunciaId: string, @Req() req: any) {
    return this.service.findHistorialByDenuncia(denunciaId, req.user);
  }
}