import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrintTemplateController } from './print-template.controller';
import { PrintTemplateService } from './print-template.service';
import { PrintTemplate, PrintTemplateSchema } from '../schemas/print-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrintTemplate.name, schema: PrintTemplateSchema },
    ]),
  ],
  controllers: [PrintTemplateController],
  providers: [PrintTemplateService],
  exports: [PrintTemplateService],
})
export class PrintTemplateModule { }
