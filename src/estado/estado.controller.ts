import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EstadoService } from './estado.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@Controller('estado')
export class EstadoController {
  constructor(private readonly estadoService: EstadoService) {}

  @Post()
  create(@Body() dto: CreateEstadoDto) {
    return this.estadoService.create(dto);
  }

  @Get()
  findAll() {
    return this.estadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.estadoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadoService.remove(id);
  }
}