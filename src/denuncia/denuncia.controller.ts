import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { FilterDenunciaDto } from './dto/filter-denuncia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('denuncia')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Post()
  create(@Body() dto: CreateDenunciaDto) {
    return this.denunciaService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get()
  findAll(@Query() filters: FilterDenunciaDto, @Req() req: any) {
    return this.denunciaService.findAll(filters, req.user);
  }

  @Get('public/solucionadas')
  findPublicSolved() {
    return this.denunciaService.findPublicSolved();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.denunciaService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.denunciaService.remove(id);
  }
}