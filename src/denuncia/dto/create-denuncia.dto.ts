import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDenunciaDto {
  @IsUUID()
  categoriaId!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  celularContacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombresDenunciante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  apellidosDenunciante?: string;

  @IsOptional()
  @IsBoolean()
  anonimo?: boolean;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccionTexto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  detalleCategoriaOtro?: string;
}