import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TemplateService } from './template.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplateController {
  constructor(private templateService: TemplateService) { }

  @Get()
  async findAll(@Request() req) {
    return this.templateService.findAll(req.user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.templateService.findById(id);
  }

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.templateService.create(req.user.userId, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.templateService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.templateService.delete(id);
  }
}
