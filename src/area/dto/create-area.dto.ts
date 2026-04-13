import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}