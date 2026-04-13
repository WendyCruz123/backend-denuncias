import { IsOptional, IsUUID } from 'class-validator';

export class FilterReporteDto {
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUUID()
  estadoId?: string;
}