import { IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  telephone: string;

  @IsString()
  role: string;

  @IsNumber()
  age: number;

  @IsString()
  salary: string;
}
