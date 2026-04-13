import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { FilterDenunciaDto } from './dto/filter-denuncia.dto';

@Injectable()
export class DenunciaService {
  constructor(private readonly prisma: PrismaService) {}

  private aplicarRestriccionPorArea(where: any, filters: FilterDenunciaDto, user?: any) {
    const esFuncionario = user?.roles?.includes('FUNCIONARIO');

    if (esFuncionario) {
      where.categoria = {
        ...(where.categoria || {}),
        areaId: user.areaId,
      };
      return;
    }

    if (filters.areaId) {
      where.categoria = {
        ...(where.categoria || {}),
        areaId: filters.areaId,
      };
    }
  }

  async create(dto: CreateDenunciaDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: dto.categoriaId },
      include: {
        area: true,
      },
    });

    if (!categoria || categoria.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('La categoría no existe o está inactiva');
    }

    const esOtro = categoria.nombre.trim().toUpperCase() === 'OTRO';

    if (esOtro && !dto.detalleCategoriaOtro?.trim()) {
      throw new BadRequestException(
        'Debe especificar el detalle de la categoría cuando selecciona OTRO',
      );
    }

    const estadoInicial = await this.prisma.estado.findFirst({
      where: {
        nombre: 'RECIBIDO',
        estadoRegistro: 'ACTIVO',
      },
    });

    if (!estadoInicial) {
      throw new BadRequestException(
        'No existe el estado inicial RECIBIDO. Debe crearse primero.',
      );
    }

    const anonimo = dto.anonimo ?? false;

    const denuncia = await this.prisma.denuncia.create({
      data: {
        categoriaId: dto.categoriaId,
        descripcion: dto.descripcion.trim(),
        celularContacto: dto.celularContacto.trim(),
        nombresDenunciante: anonimo ? null : dto.nombresDenunciante?.trim(),
        apellidosDenunciante: anonimo ? null : dto.apellidosDenunciante?.trim(),
        anonimo,
        latitud: dto.latitud,
        longitud: dto.longitud,
        direccionTexto: dto.direccionTexto?.trim(),
        detalleCategoriaOtro: esOtro ? dto.detalleCategoriaOtro?.trim() : null,
      },
      include: {
        categoria: {
          include: {
            area: true,
          },
        },
      },
    });

    await this.prisma.denunciaEstado.create({
      data: {
        denunciaId: denuncia.id,
        estadoId: estadoInicial.id,
        comentario: 'Estado inicial automático al registrar la denuncia',
      },
    });

    return this.findOne(denuncia.id);
  }

  async findAll(filters: FilterDenunciaDto, user?: any) {
    const where: any = {
      estadoRegistro: 'ACTIVO',
    };

    if (filters.categoriaId) {
      where.categoriaId = filters.categoriaId;
    }

    this.aplicarRestriccionPorArea(where, filters, user);

    if (filters.estadoId) {
      where.historialEstados = {
        some: {
          estadoId: filters.estadoId,
          estadoRegistro: 'ACTIVO',
        },
      };
    }

    if (filters.soloSolucionadas === 'true') {
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

      where.historialEstados = {
        some: {
          estadoId: estadoSolucionado.id,
          estadoRegistro: 'ACTIVO',
        },
      };
    }

    return this.prisma.denuncia.findMany({
      where,
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
  }

  async findPublicSolved() {
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

    return this.prisma.denuncia.findMany({
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
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: string, user?: any) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id },
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
    });

    if (!denuncia || denuncia.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Denuncia no encontrada');
    }

    if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== denuncia.categoria.areaId) {
      throw new BadRequestException('No puede ver denuncias de otra área');
    }

    return denuncia;
  }

  async remove(id: string) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id },
    });

    if (!denuncia || denuncia.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Denuncia no encontrada');
    }

    return this.prisma.denuncia.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}