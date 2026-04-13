import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterReporteDto } from './dto/filter-reporte.dto';

@Injectable()
export class ReporteService {
  constructor(private readonly prisma: PrismaService) {}

  private async construirWhere(filters: FilterReporteDto, user?: any) {
    const where: any = {
      estadoRegistro: 'ACTIVO',
    };

    if (filters.categoriaId) {
      where.categoriaId = filters.categoriaId;
    }

    if (user?.roles?.includes('FUNCIONARIO')) {
      where.categoria = {
        ...(where.categoria || {}),
        areaId: user.areaId,
      };
    } else if (filters.areaId) {
      where.categoria = {
        ...(where.categoria || {}),
        areaId: filters.areaId,
      };
    }

    if (filters.estadoId) {
      where.historialEstados = {
        some: {
          estadoId: filters.estadoId,
          estadoRegistro: 'ACTIVO',
        },
      };
    }

    return where;
  }

  async resumenGeneral(filters: FilterReporteDto, user?: any) {
    const where = await this.construirWhere(filters, user);

    const denuncias = await this.prisma.denuncia.findMany({
      where,
      include: {
        categoria: {
          include: {
            area: true,
          },
        },
        historialEstados: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            estado: true,
          },
          orderBy: {
            fechaCambio: 'desc',
          },
          take: 1,
        },
      },
    });

    const total = denuncias.length;
    const porEstadoMap = new Map<string, number>();
    const porAreaMap = new Map<string, number>();

    for (const denuncia of denuncias) {
      const estadoActual =
        denuncia.historialEstados[0]?.estado?.nombre || 'SIN ESTADO';
      porEstadoMap.set(
        estadoActual,
        (porEstadoMap.get(estadoActual) || 0) + 1,
      );

      const areaNombre = denuncia.categoria.area.nombre;
      porAreaMap.set(areaNombre, (porAreaMap.get(areaNombre) || 0) + 1);
    }

    return {
      totalDenuncias: total,
      porEstado: Array.from(porEstadoMap.entries()).map(([estado, total]) => ({
        estado,
        total,
      })),
      porArea: Array.from(porAreaMap.entries()).map(([area, total]) => ({
        area,
        total,
      })),
    };
  }

  async resumenPorEstado(filters: FilterReporteDto, user?: any) {
    const estados = await this.prisma.estado.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      orderBy: {
        orden: 'asc',
      },
    });

    const resultados: {
      estadoId: string;
      nombre: string;
      orden: number;
      total: number;
    }[] = [];

    for (const estado of estados) {
      const where = await this.construirWhere(
        {
          ...filters,
          estadoId: estado.id,
        },
        user,
      );

      const total = await this.prisma.denuncia.count({ where });

      resultados.push({
        estadoId: estado.id,
        nombre: estado.nombre,
        orden: estado.orden,
        total,
      });
    }

    return resultados;
  }

  async resumenPorArea(filters: FilterReporteDto, user?: any) {
    const areas = await this.prisma.area.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    const resultados: {
      areaId: string;
      nombre: string;
      total: number;
    }[] = [];

    for (const area of areas) {
      const where = await this.construirWhere(
        {
          ...filters,
          areaId: area.id,
        },
        user,
      );

      const total = await this.prisma.denuncia.count({ where });

      resultados.push({
        areaId: area.id,
        nombre: area.nombre,
        total,
      });
    }

    return resultados;
  }

  async listadoAgrupadoPorEstado(filters: FilterReporteDto, user?: any) {
    const denuncias = await this.prisma.denuncia.findMany({
      where: await this.construirWhere(filters, user),
      include: {
        categoria: {
          include: {
            area: true,
          },
        },
        archivos: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
        soluciones: {
          where: {
            estado: 'ACTIVO',
          },
          include: {
            archivos: {
              where: {
                estadoRegistro: 'ACTIVO',
              },
            },
          },
        },
        historialEstados: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            estado: true,
          },
          orderBy: {
            fechaCambio: 'desc',
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    const grupos: Record<string, any[]> = {};

    for (const denuncia of denuncias) {
      const estadoActual =
        denuncia.historialEstados[0]?.estado?.nombre || 'SIN ESTADO';

      if (!grupos[estadoActual]) {
        grupos[estadoActual] = [];
      }

      grupos[estadoActual].push(denuncia);
    }

    return grupos;
  }

  async dashboardPublico() {
    const estadoSolucionado = await this.prisma.estado.findFirst({
      where: {
        nombre: 'SOLUCIONADO',
        estadoRegistro: 'ACTIVO',
      },
    });

    if (!estadoSolucionado) {
      throw new BadRequestException(
        'No existe el estado SOLUCIONADO en el sistema',
      );
    }

    const totalSolucionadas = await this.prisma.denuncia.count({
      where: {
        estadoRegistro: 'ACTIVO',
        historialEstados: {
          some: {
            estadoId: estadoSolucionado.id,
            estadoRegistro: 'ACTIVO',
          },
        },
      },
    });

    const denunciasSolucionadas = await this.prisma.denuncia.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
        historialEstados: {
          some: {
            estadoId: estadoSolucionado.id,
            estadoRegistro: 'ACTIVO',
          },
        },
      },
      include: {
        categoria: {
          include: {
            area: true,
          },
        },
        soluciones: {
          where: {
            estado: 'ACTIVO',
          },
          include: {
            archivos: {
              where: {
                estadoRegistro: 'ACTIVO',
              },
            },
          },
        },
        historialEstados: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            estado: true,
          },
          orderBy: {
            fechaCambio: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    return {
      totalSolucionadas,
      denunciasSolucionadas,
    };
  }
}