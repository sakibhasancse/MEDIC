import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hospitals')
@UseGuards(JwtAuthGuard)
export class HospitalController {
  constructor(private hospitalService: HospitalService) { }

  @Get()
  async getAll(@Request() req) {
    return this.hospitalService.findAll(req.user.userId);
  }

  @Get('default')
  async getDefault(@Request() req) {
    return this.hospitalService.findDefault(req.user.userId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.hospitalService.findById(id);
  }

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.hospitalService.create(req.user.userId, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.hospitalService.update(id, body);
  }

  @Put(':id/set-default')
  async setDefault(@Request() req, @Param('id') id: string) {
    return this.hospitalService.setDefault(req.user.userId, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.hospitalService.delete(id);
  }
}
