import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('medical-history')
@UseGuards(JwtAuthGuard)
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) { }

  @Get('timeline')
  async getTimeline(@Request() req) {
    return this.medicalHistoryService.getTimeline(req.user.userId);
  }
}
