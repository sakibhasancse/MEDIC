import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DoctorProfileService } from './doctor-profile.service';

@Controller('doctor-profile')
export class DoctorProfileController {
  constructor(private readonly doctorProfileService: DoctorProfileService) { }

  @Post(':userId')
  async createOrUpdate(@Param('userId') userId: string, @Body() profileData: any) {
    return this.doctorProfileService.createOrUpdate(userId, profileData);
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.doctorProfileService.findByUserId(userId);
  }
}
