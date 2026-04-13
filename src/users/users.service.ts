import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarUsername(username: string) {
    return username.trim().toLowerCase();
  }

  async findByUsername(username: string) {
    const usernameNormalizado = this.normalizarUsername(username);

    return this.prisma.usuario.findUnique({
      where: { username: usernameNormalizado },
      include: {
        persona: true,
        area: true,
        rolesUsuario: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async create(dto: CreateUserDto) {
    const usernameNormalizado = this.normalizarUsername(dto.username);

    const persona = await this.prisma.persona.findUnique({
      where: { id: dto.personaId },
    });

    if (!persona || persona.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('La persona no existe o está inactiva');
    }

    const area = await this.prisma.area.findUnique({
      where: { id: dto.areaId },
    });

    if (!area || area.estadoRegistro !== 'ACTIVO') {
      throw new BadRequestException('El área no existe o está inactiva');
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { username: usernameNormalizado },
    });

    if (usuarioExistente) {
      throw new BadRequestException('Ya existe un usuario con ese username');
    }

    const personaConUsuario = await this.prisma.usuario.findFirst({
      where: {
        personaId: dto.personaId,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (personaConUsuario) {
      throw new BadRequestException('Esa persona ya tiene cuenta de usuario');
    }

    const passwordPlano = `${persona.ci}_AER`;
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    return this.prisma.usuario.create({
      data: {
        username: usernameNormalizado,
        passwordHash,
        personaId: dto.personaId,
        areaId: dto.areaId,
      },
      include: {
        persona: true,
        area: true,
        rolesUsuario: {
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      include: {
        persona: true,
        area: true,
        rolesUsuario: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            rol: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        persona: true,
        area: true,
        rolesUsuario: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            rol: true,
          },
        },
      },
    });

    if (!usuario || usuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async update(id: string, dto: UpdateUserDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario || usuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Usuario no encontrado');
    }

    const data: UpdateUserDto = {};

    if (dto.username) {
      const usernameNormalizado = this.normalizarUsername(dto.username);

      const existe = await this.prisma.usuario.findFirst({
        where: {
          username: usernameNormalizado,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existe) {
        throw new BadRequestException('Ya existe otro usuario con ese username');
      }

      data.username = usernameNormalizado;
    }

    if (dto.areaId) {
      const area = await this.prisma.area.findUnique({
        where: { id: dto.areaId },
      });

      if (!area || area.estadoRegistro !== 'ACTIVO') {
        throw new BadRequestException('El área no existe o está inactiva');
      }

      data.areaId = dto.areaId;
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      include: {
        persona: true,
        area: true,
        rolesUsuario: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
          include: {
            rol: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        rolesUsuario: {
          where: {
            estadoRegistro: 'ACTIVO',
          },
        },
      },
    });

    if (!usuario || usuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.usuario.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }

  async resetPassword(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        persona: true,
      },
    });

    if (!usuario || usuario.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordPlano = `${usuario.persona.ci}_AER`;
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    await this.prisma.usuario.update({
      where: { id },
      data: {
        passwordHash,
      },
    });

    return {
      message: 'Contraseña restablecida correctamente',
      passwordTemporal: passwordPlano,
    };
  }
}