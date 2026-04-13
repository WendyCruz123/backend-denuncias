import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolUsuarioDto } from './dto/create-rol-usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol-usuario.dto';

@Injectable()
export class RolUsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRolUsuarioDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: dto.userId },
      include: {
        persona: true,
        area: true,
      },
    });

    if (!user || user.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('El usuario no existe o está inactivo');
    }

    const rol = await this.prisma.rol.findUnique({
      where: { id: dto.roleId },
    });

    if (!rol || rol.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('El rol no existe o está inactivo');
    }

    const yaAsignado = await this.prisma.rolUsuario.findFirst({
      where: {
        userId: dto.userId,
        roleId: dto.roleId,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (yaAsignado) {
      throw new BadRequestException('Ese rol ya está asignado al usuario');
    }

    return this.prisma.rolUsuario.create({
      data: {
        userId: dto.userId,
        roleId: dto.roleId,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
      include: {
        usuario: {
          include: {
            persona: true,
            area: true,
          },
        },
        rol: true,
      },
    });
  }

  async findAll() {
    return this.prisma.rolUsuario.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      include: {
        usuario: {
          include: {
            persona: true,
            area: true,
          },
        },
        rol: true,
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const rolUsuario = await this.prisma.rolUsuario.findUnique({
      where: { id },
      include: {
        usuario: {
          include: {
            persona: true,
            area: true,
          },
        },
        rol: true,
      },
    });

    if (!rolUsuario || rolUsuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Asignación de rol no encontrada');
    }

    return rolUsuario;
  }

  async update(id: string, dto: UpdateRolUsuarioDto) {
    const rolUsuario = await this.prisma.rolUsuario.findUnique({
      where: { id },
    });

    if (!rolUsuario || rolUsuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Asignación de rol no encontrada');
    }

    return this.prisma.rolUsuario.update({
      where: { id },
      data: {
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
      include: {
        usuario: {
          include: {
            persona: true,
            area: true,
          },
        },
        rol: true,
      },
    });
  }

  async remove(id: string) {
    const rolUsuario = await this.prisma.rolUsuario.findUnique({
      where: { id },
    });

    if (!rolUsuario || rolUsuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Asignación de rol no encontrada');
    }

    return this.prisma.rolUsuario.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}