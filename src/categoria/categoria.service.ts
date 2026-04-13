import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarNombre(nombre: string) {
    return nombre.trim().toUpperCase();
  }

  async create(dto: CreateCategoriaDto) {
    const nombreNormalizado = this.normalizarNombre(dto.nombre);

    const area = await this.prisma.area.findUnique({
      where: { id: dto.areaId },
    });

    if (!area || area.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('El área no existe o está inactiva');
    }

    const existe = await this.prisma.categoria.findFirst({
      where: {
        nombre: nombreNormalizado,
        areaId: dto.areaId,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe una categoría con ese nombre en esa área',
      );
    }

    return this.prisma.categoria.create({
      data: {
        nombre: nombreNormalizado,
        descripcion: dto.descripcion?.trim(),
        areaId: dto.areaId,
        leyRespaldo: dto.leyRespaldo?.trim(),
      },
      include: {
        area: true,
      },
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      include: {
        area: true,
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        area: true,
        _count: {
          select: {
            denuncias: true,
          },
        },
      },
    });

    if (!categoria || categoria.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Categoría no encontrada');
    }

    return categoria;
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria || categoria.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Categoría no encontrada');
    }

    let areaId = categoria.areaId;

    if (dto.areaId) {
      const area = await this.prisma.area.findUnique({
        where: { id: dto.areaId },
      });

      if (!area || area.estadoRegistro !== 'ACTIVO') {
        throw new BadRequestException('El área no existe o está inactiva');
      }

      areaId = dto.areaId;
    }

    const data: UpdateCategoriaDto = {};

    if (dto.nombre) {
      const nombreNormalizado = this.normalizarNombre(dto.nombre);

      const existe = await this.prisma.categoria.findFirst({
        where: {
          nombre: nombreNormalizado,
          areaId,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existe) {
        throw new BadRequestException(
          'Ya existe otra categoría con ese nombre en esa área',
        );
      }

      data.nombre = nombreNormalizado;
    }

    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion?.trim();
    }

    if (dto.areaId !== undefined) {
      data.areaId = dto.areaId;
    }

    if (dto.leyRespaldo !== undefined) {
      data.leyRespaldo = dto.leyRespaldo?.trim();
    }

    return this.prisma.categoria.update({
      where: { id },
      data,
      include: {
        area: true,
      },
    });
  }

  async remove(id: string) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            denuncias: true,
          },
        },
      },
    });

    if (!categoria || categoria.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (categoria._count.denuncias > 0) {
      throw new BadRequestException(
        'No se puede desactivar la categoría porque tiene denuncias registradas',
      );
    }

    return this.prisma.categoria.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}