import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SolucionService } from './solucion.service';
import { CreateSolucionDto } from './dto/create-solucion.dto';
import { UpdateSolucionDto } from './dto/update-solucion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('solucion')
export class SolucionController {
  constructor(private readonly solucionService: SolucionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'FUNCIONARIO')
  @Post()
  create(@Body() dto: CreateSolucionDto, @Req() req: any) {
    return this.solucionService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get()
  findAll(@Query('areaId') areaId?: string, @Req() req?: any) {
    return this.solucionService.findAll(areaId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.solucionService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'FUNCIONARIO')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSolucionDto, @Req() req: any) {
    return this.solucionService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'FUNCIONARIO')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.solucionService.remove(id, req.user);
  }
}