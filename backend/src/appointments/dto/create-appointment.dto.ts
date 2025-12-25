import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  @IsNotEmpty()
  clinicId: string;

  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsEnum(['online', 'physical'])
  @IsNotEmpty()
  visitType: 'online' | 'physical';

  @IsString()
  @IsOptional()
  notes?: string;
}
