import { IsBooleanString, IsOptional, IsUUID } from 'class-validator';

export class FilterDenunciaDto {
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUUID()
  estadoId?: string;

  @IsOptional()
  @IsBooleanString()
  soloSolucionadas?: string;
}