import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class PatientRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  age?: number;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: string;
}
