import { IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';

export class CreateArchivoDto {
  @IsOptional()
  @IsUUID()
  solucionId?: string;

  @IsOptional()
  @IsUUID()
  denunciaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}