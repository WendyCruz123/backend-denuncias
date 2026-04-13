import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDenunciaEstadoDto {
  @IsUUID()
  denunciaId!: string;

  @IsUUID()
  estadoId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  comentario?: string;
}