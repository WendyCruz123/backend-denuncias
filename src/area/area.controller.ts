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
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post()
  create(@Body() dto: CreateAreaDto) {
    return this.areaService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Get()
  findAll() {
    return this.areaService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.areaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areaService.remove(id);
  }
}