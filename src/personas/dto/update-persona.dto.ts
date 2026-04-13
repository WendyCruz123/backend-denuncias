import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePersonaDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  apellidos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  celular?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  ci?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  tipoPersona?: string;
}