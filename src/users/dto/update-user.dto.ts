import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsEmail()
  username?: string;
}