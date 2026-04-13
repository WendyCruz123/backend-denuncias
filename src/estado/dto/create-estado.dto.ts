import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateEstadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsInt()
  @Min(1)
  orden!: number;
}