import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSolucionDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}