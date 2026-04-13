import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { FilterReporteDto } from './dto/filter-reporte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get('resumen-general')
  resumenGeneral(@Query() filters: FilterReporteDto, @Req() req: any) {
    return this.reporteService.resumenGeneral(filters, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get('resumen-por-estado')
  resumenPorEstado(@Query() filters: FilterReporteDto, @Req() req: any) {
    return this.reporteService.resumenPorEstado(filters, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get('resumen-por-area')
  resumenPorArea(@Query() filters: FilterReporteDto, @Req() req: any) {
    return this.reporteService.resumenPorArea(filters, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get('agrupado-por-estado')
  listadoAgrupadoPorEstado(@Query() filters: FilterReporteDto, @Req() req: any) {
    return this.reporteService.listadoAgrupadoPorEstado(filters, req.user);
  }

  @Get('dashboard-publico')
  dashboardPublico() {
    return this.reporteService.dashboardPublico();
  }
}