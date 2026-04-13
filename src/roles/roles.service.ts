import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarNombre(nombre: string) {
    return nombre.trim().toUpperCase();
  }

  async create(dto: CreateRolDto) {
    const nombreNormalizado = this.normalizarNombre(dto.nombre);

    const existe = await this.prisma.rol.findFirst({
      where: {
        nombre: nombreNormalizado,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existe) {
      throw new BadRequestException('El rol ya existe');
    }

    return this.prisma.rol.create({
      data: {
        nombre: nombreNormalizado,
        descripcion: dto.descripcion?.trim(),
      },
    });
  }

  async findAll() {
    return this.prisma.rol.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rolesUsuario: true,
          },
        },
      },
    });

    if (!rol || rol.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Rol no encontrado');
    }

    return rol;
  }

  async update(id: string, dto: UpdateRolDto) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
    });

    if (!rol || rol.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Rol no encontrado');
    }

    const data: UpdateRolDto = {};

    if (dto.nombre) {
      const nombreNormalizado = this.normalizarNombre(dto.nombre);

      const existe = await this.prisma.rol.findFirst({
        where: {
          nombre: nombreNormalizado,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existe) {
        throw new BadRequestException('Ya existe otro rol con ese nombre');
      }

      data.nombre = nombreNormalizado;
    }

    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion?.trim();
    }

    return this.prisma.rol.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rolesUsuario: true,
          },
        },
      },
    });

    if (!rol || rol.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Rol no encontrado');
    }

    if (rol._count.rolesUsuario > 0) {
      throw new BadRequestException(
        'No se puede desactivar el rol porque está asignado a uno o más usuarios',
      );
    }

    return this.prisma.rol.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}