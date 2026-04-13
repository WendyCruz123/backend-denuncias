import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  leyRespaldo?: string;
}