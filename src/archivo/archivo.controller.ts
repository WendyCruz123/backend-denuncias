import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ArchivoService } from './archivo.service';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

function generarNombreArchivo(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const extension = extname(file.originalname);
  callback(null, `${uniqueSuffix}${extension}`);
}

function filtroArchivos(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/x-m4a',
    'audio/mp4',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!tiposPermitidos.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        'Tipo de archivo no permitido. Solo se admiten imágenes, videos, audios, PDF y Word',
      ) as any,
      false,
    );
  }

  callback(null, true);
}

@Controller('archivo')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  @Post('upload-public')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: generarNombreArchivo,
      }),
      fileFilter: filtroArchivos,
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  createPublic(
    @Body() dto: CreateArchivoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.archivoService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'FUNCIONARIO')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: generarNombreArchivo,
      }),
      fileFilter: filtroArchivos,
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() dto: CreateArchivoDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.archivoService.create(dto, file, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get()
  findAll(
    @Query('denunciaId') denunciaId?: string,
    @Query('solucionId') solucionId?: string,
    @Req() req?: any,
  ) {
    return this.archivoService.findAll(denunciaId, solucionId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'FUNCIONARIO')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.archivoService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'FUNCIONARIO')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.archivoService.remove(id, req.user);
  }
}