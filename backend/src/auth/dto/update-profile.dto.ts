import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsObject()
  @IsOptional()
  prescriptionHeader?: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };

  @IsObject()
  @IsOptional()
  prescriptionFooter?: {
    text?: string;
  };

  @IsString()
  @IsOptional()
  signature?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultAdvice?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultDoses?: string[];

  @IsEnum(['en', 'bn'])
  @IsOptional()
  language?: string;
}
