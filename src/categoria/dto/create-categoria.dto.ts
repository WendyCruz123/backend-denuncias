import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsUUID()
  areaId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  leyRespaldo?: string;
}