import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolucionDto } from './dto/create-solucion.dto';
import { UpdateSolucionDto } from './dto/update-solucion.dto';

@Injectable()
export class SolucionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSolucionDto, user?: any) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id: dto.denunciaId },
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

    const area = await this.prisma.area.findUnique({
      where: { id: dto.areaId },
    });

    if (!area || area.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('El área no existe o está inactiva');
    }

    if (denuncia.categoria.areaId !== dto.areaId) {
      throw new BadRequestException(
        'El área de la solución debe coincidir con el área de la denuncia',
      );
    }

    const solucionExistente = await this.prisma.solucion.findFirst({
      where: {
        denunciaId: dto.denunciaId,
        estado: 'ACTIVO',
      },
    });

    if (solucionExistente) {
      throw new BadRequestException(
        'La denuncia ya tiene una solución activa registrada',
      );
    }

    if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== dto.areaId) {
      throw new BadRequestException(
        'No puede registrar soluciones para otra área',
      );
    }

    return this.prisma.solucion.create({
      data: {
        denunciaId: dto.denunciaId,
        areaId: dto.areaId,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        fechaSolucion: new Date(),
      },
      include: {
        denuncia: {
          include: {
            categoria: {
              include: {
                area: true,
              },
            },
          },
        },
        area: true,
        archivos: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
      },
    });
  }

  async findAll(areaId?: string, user?: any) {
    const where: any = {
      estado: 'ACTIVO',
    };

    if (user?.roles?.includes('FUNCIONARIO')) {
      where.areaId = user.areaId;
    } else if (areaId) {
      where.areaId = areaId;
    }

    return this.prisma.solucion.findMany({
      where,
      include: {
        denuncia: {
          include: {
            categoria: {
              include: {
                area: true,
              },
            },
          },
        },
        area: true,
        archivos: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: string, user?: any) {
    const solucion = await this.prisma.solucion.findUnique({
      where: { id },
      include: {
        denuncia: {
          include: {
            categoria: {
              include: {
                area: true,
              },
            },
          },
        },
        area: true,
        archivos: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
      },
    });

    if (!solucion || solucion.estado !== 'ACTIVO') {
      throw new NotFoundException('Solución no encontrada');
    }

    if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== solucion.areaId) {
      throw new BadRequestException('No puede ver soluciones de otra área');
    }

    return solucion;
  }

  async update(id: string, dto: UpdateSolucionDto, user?: any) {
    const solucion = await this.prisma.solucion.findUnique({
      where: { id },
      include: {
        area: true,
      },
    });

    if (!solucion || solucion.estado !== 'ACTIVO') {
      throw new NotFoundException('Solución no encontrada');
    }

    if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== solucion.areaId) {
      throw new BadRequestException(
        'No puede editar soluciones de otra área',
      );
    }

    return this.prisma.solucion.update({
      where: { id },
      data: {
        titulo: dto.titulo?.trim(),
        descripcion: dto.descripcion?.trim(),
      },
      include: {
        denuncia: {
          include: {
            categoria: {
              include: {
                area: true,
              },
            },
          },
        },
        area: true,
        archivos: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
      },
    });
  }

  async remove(id: string, user?: any) {
    const solucion = await this.prisma.solucion.findUnique({
      where: { id },
      include: {
        archivos: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
      },
    });

    if (!solucion || solucion.estado !== 'ACTIVO') {
      throw new NotFoundException('Solución no encontrada');
    }

    if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== solucion.areaId) {
      throw new BadRequestException(
        'No puede eliminar soluciones de otra área',
      );
    }

    return this.prisma.solucion.update({
      where: { id },
      data: {
        estado: 'INACTIVO',
      },
    });
  }

  async validarSolucionConArchivos(denunciaId: string) {
    const solucion = await this.prisma.solucion.findFirst({
      where: {
        denunciaId,
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
        'La solución debe tener al menos un archivo adjunto',
      );
    }

    if (solucion.archivos.length > 3) {
      throw new BadRequestException(
        'La solución no puede tener más de 3 archivos',
      );
    }

    return true;
  }
}