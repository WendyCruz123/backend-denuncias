import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombres!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  apellidos!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  celular!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  ci!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  tipoPersona?: string;
}