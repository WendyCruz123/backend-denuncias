import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateEstadoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;
}