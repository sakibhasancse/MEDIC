import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
}
