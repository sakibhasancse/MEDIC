import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicineController {
  constructor(private medicineService: MedicineService) { }

  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.medicineService.search(query, limit ? parseInt(limit, 10) : 10);
  }

  @Get('recent')
  async getRecent(@Request() req) {
    // Get recent medicines from user profile
    const user = req.user;
    // This would need to fetch from user's recent medicines
    return [];
  }

  @Post()
  async create(@Body() body: any) {
    return this.medicineService.create(body);
  }

  @Post('seed')
  async seed() {
    await this.medicineService.seedMedicines();
    return { message: 'Medicines seeded successfully' };
  }
}
