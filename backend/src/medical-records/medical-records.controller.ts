import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UploadService } from '../upload/upload.service';

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly uploadService: UploadService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Request() req,
    @Body() createDto: CreateMedicalRecordDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileUrl = await this.uploadService.uploadFile(file);
    return this.medicalRecordsService.create(req.user.userId, createDto, fileUrl);
  }

  @Get()
  async findAll(@Request() req) {
    return this.medicalRecordsService.findAllByPatient(req.user.userId);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.medicalRecordsService.remove(id, req.user.userId);
  }
}
