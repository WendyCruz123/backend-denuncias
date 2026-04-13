import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArchivoDto } from './dto/create-archivo.dto';

@Injectable()
export class ArchivoService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarDestino(dto: CreateArchivoDto, user?: any) {
    const tieneDenuncia = !!dto.denunciaId;
    const tieneSolucion = !!dto.solucionId;

    if (!tieneDenuncia && !tieneSolucion) {
      throw new BadRequestException('Debe enviar denunciaId o solucionId');
    }

    if (tieneDenuncia && tieneSolucion) {
      throw new BadRequestException(
        'Solo puede asociar el archivo a una denuncia o a una solución, no a ambas',
      );
    }

    if (dto.denunciaId) {
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

      if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== denuncia.categoria.areaId) {
        throw new BadRequestException(
          'No puede subir archivos a denuncias de otra área',
        );
      }

      const cantidad = await this.prisma.archivo.count({
        where: {
          denunciaId: dto.denunciaId,
          estadoRegistro: 'ACTIVO',
        },
      });

      if (cantidad >= 3) {
        throw new BadRequestException(
          'La denuncia no puede tener más de 3 archivos',
        );
      }
    }

    if (dto.solucionId) {
      const solucion = await this.prisma.solucion.findUnique({
        where: { id: dto.solucionId },
        include: {
          area: true,
        },
      });

      if (!solucion || solucion.estado !== 'ACTIVO') {
        throw new NotFoundException('Solución no encontrada');
      }

      if (user?.roles?.includes('FUNCIONARIO') && user.areaId !== solucion.areaId) {
        throw new BadRequestException(
          'No puede subir archivos a soluciones de otra área',
        );
      }

      const cantidad = await this.prisma.archivo.count({
        where: {
          solucionId: dto.solucionId,
          estadoRegistro: 'ACTIVO',
        },
      });

      if (cantidad >= 3) {
        throw new BadRequestException(
          'La solución no puede tener más de 3 archivos',
        );
      }
    }
  }

  async create(
    dto: CreateArchivoDto,
    file: Express.Multer.File,
    user?: any,
  ) {
    await this.validarDestino(dto, user);

    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo');
    }

    return this.prisma.archivo.create({
      data: {
        solucionId: dto.solucionId,
        denunciaId: dto.denunciaId,
        urlArchivo: `/uploads/${file.filename}`,
        tipoArchivo: file.mimetype,
        nombreOriginal: file.originalname,
        descripcion: dto.descripcion?.trim(),
      },
    });
  }

  async findAll(denunciaId?: string, solucionId?: string, user?: any) {
    const where: any = {
      estadoRegistro: 'ACTIVO',
      ...(denunciaId ? { denunciaId } : {}),
      ...(solucionId ? { solucionId } : {}),
    };

    const archivos = await this.prisma.archivo.findMany({
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
        solucion: {
          include: {
            area: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    if (user?.roles?.includes('FUNCIONARIO')) {
      return archivos.filter((archivo) => {
        if (archivo.denuncia) {
          return archivo.denuncia.categoria.areaId === user.areaId;
        }

        if (archivo.solucion) {
          return archivo.solucion.areaId === user.areaId;
        }

        return false;
      });
    }

    return archivos;
  }

  async findOne(id: string, user?: any) {
    const archivo = await this.prisma.archivo.findUnique({
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
        solucion: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!archivo || archivo.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Archivo no encontrado');
    }

    if (user?.roles?.includes('FUNCIONARIO')) {
      const esDeSuArea =
        (archivo.denuncia && archivo.denuncia.categoria.areaId === user.areaId) ||
        (archivo.solucion && archivo.solucion.areaId === user.areaId);

      if (!esDeSuArea) {
        throw new BadRequestException(
          'No puede ver archivos de otra área',
        );
      }
    }

    return archivo;
  }

  async remove(id: string, user?: any) {
    const archivo = await this.prisma.archivo.findUnique({
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
        solucion: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!archivo || archivo.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Archivo no encontrado');
    }

    if (user?.roles?.includes('FUNCIONARIO')) {
      const esDeSuArea =
        (archivo.denuncia && archivo.denuncia.categoria.areaId === user.areaId) ||
        (archivo.solucion && archivo.solucion.areaId === user.areaId);

      if (!esDeSuArea) {
        throw new BadRequestException(
          'No puede eliminar archivos de otra área',
        );
      }
    }

    return this.prisma.archivo.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}