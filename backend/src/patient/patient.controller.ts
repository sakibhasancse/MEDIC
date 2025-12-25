import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
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

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    // req.user.userId is the patient's ID if logged in as patient
    // However, if they are logged in via phone, req.user.userId might be the Patient document ID
    // Let's verify how the patient is authenticated.
    return this.patientService.update(req.user.userId, updateData);
  }
}
