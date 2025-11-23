import { Controller, Get, Post, Query, Body, InternalServerErrorException } from '@nestjs/common';
import { GlobalHospitalService } from './global-hospital.service';
import * as path from 'path';

@Controller('global-hospitals')
export class GlobalHospitalController {
  constructor(private readonly globalHospitalService: GlobalHospitalService) { }

  @Post('import')
  async importCsv() {
    try {
      // Assuming the file is at backend/uploads/NHFCBD-2025.csv
      // We need to resolve the path relative to the project root or where the app is running
      const filePath = path.resolve(process.cwd(), 'uploads', 'NHFCBD-2025.csv');
      const result = await this.globalHospitalService.importFromCsv(filePath);
      return { message: 'Import successful', ...result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to import CSV: ' + error.message);
    }
  }

  @Get()
  async search(@Query('query') query: string) {
    return this.globalHospitalService.search(query);
  }
}
