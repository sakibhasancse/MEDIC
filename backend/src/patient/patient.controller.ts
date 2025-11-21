import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private patientService: PatientService) { }

  @Post()
  async createOrUpdate(@Request() req, @Body() body: any) {
    return this.patientService.findOrCreateByPhone(
      body.phone,
      req.user.userId,
      body
    );
  }

  @Get(':phone')
  async getByPhone(@Request() req, @Param('phone') phone: string) {
    return this.patientService.getByPhone(phone, req.user.userId);
  }
}
