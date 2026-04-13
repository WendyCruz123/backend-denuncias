import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSolucionDto {
  @IsUUID()
  denunciaId!: string;

  @IsUUID()
  areaId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;
}