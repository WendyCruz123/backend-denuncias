import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDenunciaEstadoDto } from './dto/create-denuncia-estado.dto';

@Injectable()
export class DenunciaEstadoService {
  constructor(private readonly prisma: PrismaService) {}

  async cambiarEstado(dto: CreateDenunciaEstadoDto, user?: any) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id: dto.denunciaId },
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
        },
      },
    });

    if (!denuncia || denuncia.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Denuncia no encontrada');
    }

    const nuevoEstado = await this.prisma.estado.findUnique({
      where: { id: dto.estadoId },
    });

    if (!nuevoEstado || nuevoEstado.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('Estado inválido');
    }

    const estadoActual = denuncia.historialEstados[0]?.estado;

    if (!estadoActual) {
      throw new BadRequestException('La denuncia no tiene estado actual');
    }

    if (estadoActual.id === nuevoEstado.id) {
      throw new BadRequestException(
        'La denuncia ya se encuentra en ese estado',
      );
    }

    const nombreActual = estadoActual.nombre.trim().toUpperCase();
    const nombreNuevo = nuevoEstado.nombre.trim().toUpperCase();

    const esCierre =
      nombreNuevo === 'SOLUCIONADO' || nombreNuevo === 'RECHAZADO';

    if (user?.roles?.includes('FUNCIONARIO')) {
      if (user.areaId !== denuncia.categoria.areaId) {
        throw new BadRequestException(
          'No puede modificar denuncias de otra área',
        );
      }
    }

    if (nuevoEstado.orden < estadoActual.orden) {
      throw new BadRequestException(
        'No se puede retroceder el estado de la denuncia',
      );
    }

    if (esCierre) {
      if (nombreActual !== 'EN PROCESO') {
        throw new BadRequestException(
          'Solo puede pasar a SOLUCIONADO o RECHAZADO desde EN PROCESO',
        );
      }

      const solucion = await this.prisma.solucion.findFirst({
        where: {
          denunciaId: dto.denunciaId,
          estado: 'ACTIVO',
        },
        include: {
          archivos: {
            where: {
              estadoRegistro: 'ACTIVO',
            },
          },
        },
      });

      if (!solucion) {
        throw new BadRequestException(
          'Debe registrar una solución antes de cerrar la denuncia',
        );
      }

      if (solucion.archivos.length < 1) {
        throw new BadRequestException(
          'La solución debe tener al menos un archivo antes de cerrar la denuncia',
        );
      }

      if (solucion.archivos.length > 3) {
        throw new BadRequestException(
          'La solución no puede tener más de 3 archivos',
        );
      }
    } else {
      const diferencia = nuevoEstado.orden - estadoActual.orden;

      if (diferencia !== 1) {
        throw new BadRequestException(
          'Debe seguir el orden de estados y no puede saltarlos',
        );
      }
    }

    return this.prisma.denunciaEstado.create({
      data: {
        denunciaId: dto.denunciaId,
        estadoId: dto.estadoId,
        comentario: dto.comentario?.trim(),
      },
      include: {
        estado: true,
        denuncia: {
          include: {
            categoria: {
              include: {
                area: true,
              },
            },
          },
        },
      },
    });
  }

  async findHistorialByDenuncia(denunciaId: string, user?: any) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id: denunciaId },
      include: {
        categoria: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!denuncia || denuncia.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Denuncia no encontrada');
    }

    if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== denuncia.categoria.areaId) {
      throw new BadRequestException(
        'No puede ver el historial de denuncias de otra área',
      );
    }

    return this.prisma.denunciaEstado.findMany({
      where: {
        denunciaId,
        estadoRegistro: 'ACTIVO',
      },
      include: {
        estado: true,
      },
      orderBy: {
        fechaCambio: 'asc',
      },
    });
  }
}