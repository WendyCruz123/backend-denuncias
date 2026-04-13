import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateRolUsuarioDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  roleId!: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}