import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}