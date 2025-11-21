import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { FeatureSettingsService } from './feature-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feature-settings')
@UseGuards(JwtAuthGuard)
export class FeatureSettingsController {
  constructor(private featureSettingsService: FeatureSettingsService) { }

  @Get()
  async getSettings(@Request() req) {
    return this.featureSettingsService.getSettings(req.user.userId);
  }

  @Put()
  async updateSettings(@Request() req, @Body() body: any) {
    return this.featureSettingsService.updateSettings(req.user.userId, body);
  }
}
