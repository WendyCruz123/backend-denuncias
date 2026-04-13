import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarNombre(nombre: string) {
    return nombre.trim().toUpperCase();
  }

  async create(dto: CreateAreaDto) {
    const nombreNormalizado = this.normalizarNombre(dto.nombre);

    const existe = await this.prisma.area.findFirst({
      where: {
        nombre: nombreNormalizado,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existe) {
      throw new BadRequestException('Ya existe un área con ese nombre');
    }

    return this.prisma.area.create({
      data: {
        nombre: nombreNormalizado,
        descripcion: dto.descripcion?.trim(),
      },
    });
  }

  async findAll() {
    return this.prisma.area.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            categorias: true,
            soluciones: true,
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    return area;
  }

  async update(id: string, dto: UpdateAreaDto) {
    const area = await this.prisma.area.findUnique({
      where: { id },
    });

    if (!area || area.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Área no encontrada');
    }

    const data: UpdateAreaDto = {};

    if (dto.nombre) {
      const nombreNormalizado = this.normalizarNombre(dto.nombre);

      const existe = await this.prisma.area.findFirst({
        where: {
          nombre: nombreNormalizado,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existe) {
        throw new BadRequestException('Ya existe otra área con ese nombre');
      }

      data.nombre = nombreNormalizado;
    }

    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion?.trim();
    }

    return this.prisma.area.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            categorias: true,
            soluciones: true,
          },
        },
      },
    });

    if (!area || area.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Área no encontrada');
    }

    if (
      area._count.usuarios > 0 ||
      area._count.categorias > 0 ||
      area._count.soluciones > 0
    ) {
      throw new BadRequestException(
        'No se puede desactivar el área porque tiene registros relacionados',
      );
    }

    return this.prisma.area.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}