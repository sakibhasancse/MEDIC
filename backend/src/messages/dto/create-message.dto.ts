import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  receiverId: string;

  @IsEnum(['Patient', 'User'])
  @IsNotEmpty()
  receiverModel: 'Patient' | 'User';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
