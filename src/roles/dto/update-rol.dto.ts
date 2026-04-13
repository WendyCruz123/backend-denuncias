import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRolDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}