import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  username!: string;

  @IsString()
  @MinLength(3)
  password!: string;
}