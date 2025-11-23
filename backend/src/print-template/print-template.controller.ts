import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PrintTemplateService } from './print-template.service';

@Controller('print-templates')
export class PrintTemplateController {
  constructor(private readonly printTemplateService: PrintTemplateService) { }

  @Get()
  findAll() {
    return this.printTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.printTemplateService.findOne(id);
  }

  @Post('seed')
  seed() {
    return this.printTemplateService.seedDefaults();
  }

  @Post()
  create(@Body() createTemplateDto: any) {
    return this.printTemplateService.create(createTemplateDto);
  }

  @Post(':id/clone')
  cloneWithColors(@Param('id') id: string, @Body() colorScheme: any) {
    return this.printTemplateService.cloneWithColors(id, colorScheme);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.printTemplateService.findByDoctor(doctorId);
  }

  @Put(':id/layout')
  updateLayout(@Param('id') id: string, @Body() layout: any) {
    return this.printTemplateService.updateLayout(id, layout);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.printTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.printTemplateService.delete(id);
  }

  @Get(':id/preview-data')
  getPreviewData(@Param('id') id: string) {
    return this.printTemplateService.getPreviewData(id);
  }
}
