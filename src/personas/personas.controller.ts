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
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  create(@Body() dto: CreatePersonaDto) {
    return this.personasService.create(dto);
  }

  @Get()
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonaDto) {
    return this.personasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}