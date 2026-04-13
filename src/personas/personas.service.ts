import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarTexto(valor: string) {
    return valor.trim();
  }

  private normalizarEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizarCi(ci: string) {
    return ci.trim().toUpperCase();
  }

  async create(dto: CreatePersonaDto) {
    const emailNormalizado = this.normalizarEmail(dto.email);
    const ciNormalizado = this.normalizarCi(dto.ci);

    const existeEmail = await this.prisma.persona.findFirst({
      where: {
        email: emailNormalizado,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existeEmail) {
      throw new BadRequestException('Ya existe una persona con ese email');
    }

    const existeCi = await this.prisma.persona.findFirst({
      where: {
        ci: ciNormalizado,
        estadoRegistro: 'ACTIVO',
      },
    });

    if (existeCi) {
      throw new BadRequestException('Ya existe una persona con ese CI');
    }

    return this.prisma.persona.create({
      data: {
        nombres: this.normalizarTexto(dto.nombres),
        apellidos: this.normalizarTexto(dto.apellidos),
        celular: this.normalizarTexto(dto.celular),
        email: emailNormalizado,
        ci: ciNormalizado,
        tipoPersona: dto.tipoPersona?.trim().toUpperCase() || 'FUNCIONARIO',
      },
    });
  }

  async findAll() {
    return this.prisma.persona.findMany({
      where: {
        estadoRegistro: 'ACTIVO',
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
      include: {
        usuario: true,
      },
    });
  }

  async findOne(id: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!persona || persona.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Persona no encontrada');
    }

    return persona;
  }

  async update(id: string, dto: UpdatePersonaDto) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
    });

    if (!persona || persona.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Persona no encontrada');
    }

    const data: UpdatePersonaDto = {};

    if (dto.email) {
      const emailNormalizado = this.normalizarEmail(dto.email);

      const existeEmail = await this.prisma.persona.findFirst({
        where: {
          email: emailNormalizado,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existeEmail) {
        throw new BadRequestException('Ya existe otra persona con ese email');
      }

      data.email = emailNormalizado;
    }

    if (dto.ci) {
      const ciNormalizado = this.normalizarCi(dto.ci);

      const existeCi = await this.prisma.persona.findFirst({
        where: {
          ci: ciNormalizado,
          estadoRegistro: 'ACTIVO',
          NOT: { id },
        },
      });

      if (existeCi) {
        throw new BadRequestException('Ya existe otra persona con ese CI');
      }

      data.ci = ciNormalizado;
    }

    if (dto.nombres !== undefined) {
      data.nombres = this.normalizarTexto(dto.nombres);
    }

    if (dto.apellidos !== undefined) {
      data.apellidos = this.normalizarTexto(dto.apellidos);
    }

    if (dto.celular !== undefined) {
      data.celular = this.normalizarTexto(dto.celular);
    }

    if (dto.tipoPersona !== undefined) {
      data.tipoPersona = dto.tipoPersona.trim().toUpperCase();
    }

    return this.prisma.persona.update({
      where: { id },
      data,
      include: {
        usuario: true,
      },
    });
  }

  async remove(id: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!persona || persona.estadoRegistro !== 'ACTIVO') {
      throw new NotFoundException('Persona no encontrada');
    }

    if (persona.usuario) {
      throw new BadRequestException(
        'No se puede desactivar la persona porque ya tiene un usuario asociado',
      );
    }

    return this.prisma.persona.update({
      where: { id },
      data: {
        estadoRegistro: 'INACTIVO',
      },
    });
  }
}