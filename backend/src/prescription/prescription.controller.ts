import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
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
  @Get()
  async getAll(@Request() req) {
    return this.prescriptionService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.prescriptionService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.prescriptionService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.prescriptionService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async generateShareLink(@Param('id') id: string) {
    return this.prescriptionService.generateShareToken(id);
  }

  @Get('share/:token')
  async getByShareToken(@Param('token') token: string) {
    return this.prescriptionService.findByShareToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async downloadPDF(@Param('id') id: string, @Res() res: Response) {
    const prescription = await this.prescriptionService.findById(id);
    if (!prescription || !prescription.pdfUrl) {
      // Generate PDF on-demand if not exists
      await this.prescriptionService.generatePDF(id);
      const updatedPrescription = await this.prescriptionService.findById(id);
      if (!updatedPrescription || !updatedPrescription.pdfUrl) {
        return res.status(404).json({ message: 'PDF generation failed' });
      }
      const pdfPath = path.join(process.cwd(), updatedPrescription.pdfUrl);
      return res.download(pdfPath);
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
