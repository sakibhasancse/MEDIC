
import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { DoctorProfileService } from './doctor-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doctor-profile')
export class DoctorProfileController {
  constructor(private readonly doctorProfileService: DoctorProfileService) { }

  @Get('public/list')
  async listPublic(@Query('userId') userId?: string) {
    return this.doctorProfileService.listAllPublic(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrUpdate(@Request() req, @Body() profileData: any) {
    return this.doctorProfileService.createOrUpdate(req.user.userId, profileData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByUserId(@Request() req) {
    return this.doctorProfileService.findByUserId(req.user.userId);
  }
}
