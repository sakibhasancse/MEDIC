
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DoctorProfileService } from './doctor-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doctor-profile')
@UseGuards(JwtAuthGuard)
export class DoctorProfileController {
  constructor(private readonly doctorProfileService: DoctorProfileService) { }

  @Post()
  async createOrUpdate(@Request() req, @Body() profileData: any) {
    return this.doctorProfileService.createOrUpdate(req.user.userId, profileData);
  }

  @Get()
  async findByUserId(@Request() req) {
    return this.doctorProfileService.findByUserId(req.user.userId);
  }
}
