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
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get('public')
  findAllPublic() {
    return this.categoriaService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post()
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriaService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.categoriaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaService.remove(id);
  }
}