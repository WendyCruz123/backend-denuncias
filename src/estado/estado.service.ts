import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Injectable()
export class EstadoService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarNombre(nombre: string) {
    return nombre.trim().toUpperCase();
  }

  async create(dto: CreateEstadoDto) {
    const nombreNormalizado = this.normalizarNombre(dto.nombre);

    const existeNombre = await this.prisma.estado.findFirst({
      where: {
        nombre: nombreNormalizado,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existeNombre) {
      throw new BadRequestException('Ya existe un estado con ese nombre');
    }

    const existeOrden = await this.prisma.estado.findFirst({
      where: {
        orden: dto.orden,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existeOrden) {
      throw new BadRequestException('Ya existe un estado con ese orden');
    }

    return this.prisma.estado.create({
      data: {
        nombre: nombreNormalizado,
        orden: dto.orden,
      },
    });
  }

  async findAll() {
    return this.prisma.estado.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      orderBy: {
        orden: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const estado = await this.prisma.estado.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            denunciasEstado: true,
          },
        },
      },
    });

    if (!estado || estado.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Estado no encontrado');
    }

    return estado;
  }

  async update(id: string, dto: UpdateEstadoDto) {
    const estado = await this.prisma.estado.findUnique({
      where: { id },
    });

    if (!estado || estado.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Estado no encontrado');
    }

    const data: UpdateEstadoDto = {};

    if (dto.nombre) {
      const nombreNormalizado = this.normalizarNombre(dto.nombre);

      const existeNombre = await this.prisma.estado.findFirst({
        where: {
          nombre: nombreNormalizado,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existeNombre) {
        throw new BadRequestException('Ya existe otro estado con ese nombre');
      }

      data.nombre = nombreNormalizado;
    }

    if (dto.orden !== undefined) {
      const existeOrden = await this.prisma.estado.findFirst({
        where: {
          orden: dto.orden,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existeOrden) {
        throw new BadRequestException('Ya existe otro estado con ese orden');
      }

      data.orden = dto.orden;
    }

    return this.prisma.estado.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const estado = await this.prisma.estado.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            denunciasEstado: true,
          },
        },
      },
    });

    if (!estado || estado.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Estado no encontrado');
    }

    if (estado._count.denunciasEstado > 0) {
      throw new BadRequestException(
        'No se puede desactivar el estado porque ya fue usado en denuncias',
      );
    }

    return this.prisma.estado.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}