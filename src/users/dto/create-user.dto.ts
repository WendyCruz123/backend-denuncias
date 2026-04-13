import { IsEmail, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  personaId!: string;

  @IsUUID()
  areaId!: string;

  @IsEmail()
  username!: string;
}