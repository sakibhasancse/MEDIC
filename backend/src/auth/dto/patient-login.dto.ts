import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PatientLoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
