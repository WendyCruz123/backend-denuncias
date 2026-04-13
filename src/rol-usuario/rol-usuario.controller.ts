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
import { RolUsuarioService } from './rol-usuario.service';
import { CreateRolUsuarioDto } from './dto/create-rol-usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@Controller('rol-usuario')
export class RolUsuarioController {
  constructor(private readonly rolUsuarioService: RolUsuarioService) {}

  @Post()
  create(@Body() dto: CreateRolUsuarioDto) {
    return this.rolUsuarioService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolUsuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolUsuarioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRolUsuarioDto) {
    return this.rolUsuarioService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolUsuarioService.remove(id);
  }
}