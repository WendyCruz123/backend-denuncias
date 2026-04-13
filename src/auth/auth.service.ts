import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      personaId: user.personaId,
      areaId: user.areaId,
      roles: user.rolesUsuario.map((r) => r.rol.nombre),
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        persona: user.persona,
        area: user.area,
        roles: user.rolesUsuario.map((r) => r.rol.nombre),
      },
    };
  }
}