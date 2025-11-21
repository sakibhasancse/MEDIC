import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrescriptionService } from './prescription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as path from 'path';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private prescriptionService: PrescriptionService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.prescriptionService.create(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.prescriptionService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async downloadPDF(@Param('id') id: string, @Res() res: Response) {
    const prescription = await this.prescriptionService.findById(id);
    if (!prescription || !prescription.pdfUrl) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const pdfPath = path.join(process.cwd(), prescription.pdfUrl);
    res.download(pdfPath);
  }

  @Get('verify/:prescriptionNumber')
  async verify(@Param('prescriptionNumber') prescriptionNumber: string) {
    return this.prescriptionService.findByPrescriptionNumber(prescriptionNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient/:patientId/history')
  async getPatientHistory(
    @Param('patientId') patientId: string,
    @Query() filters: any
  ) {
    return this.prescriptionService.getPatientHistory(patientId, filters);
  }
}
