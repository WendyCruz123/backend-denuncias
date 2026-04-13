import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PersonasModule } from './personas/personas.module';
import { RolesModule } from './roles/roles.module';
import { RolUsuarioModule } from './rol-usuario/rol-usuario.module';
import { AreaModule } from './area/area.module';
import { CategoriaModule } from './categoria/categoria.module';
import { EstadoModule } from './estado/estado.module';
import { DenunciaModule } from './denuncia/denuncia.module';
import { DenunciaEstadoModule } from './denuncia-estado/denuncia-estado.module';
import { SolucionModule } from './solucion/solucion.module';
import { ArchivoModule } from './archivo/archivo.module';
import { ReporteModule } from './reporte/reporte.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PersonasModule,
    RolesModule,
    RolUsuarioModule,
    AreaModule,
    CategoriaModule,
    EstadoModule,
    DenunciaModule,
    DenunciaEstadoModule,
    SolucionModule,
    ArchivoModule,
    ReporteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}