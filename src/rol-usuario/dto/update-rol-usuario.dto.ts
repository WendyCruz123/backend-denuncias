import { IsDateString, IsOptional } from 'class-validator';

export class UpdateRolUsuarioDto {
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}