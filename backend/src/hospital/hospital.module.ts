import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { Hospital, HospitalSchema } from '../schemas/hospital.schema';
import { PrintTemplateModule } from '../print-template/print-template.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }]),
    PrintTemplateModule,
  ],
  providers: [HospitalService],
  controllers: [HospitalController],
  exports: [HospitalService],
})
export class HospitalModule { }
