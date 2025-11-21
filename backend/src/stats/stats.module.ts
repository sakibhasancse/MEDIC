import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Prescription, PrescriptionSchema } from '../schemas/prescription.schema';
import { Patient, PatientSchema } from '../schemas/patient.schema';
import { Template, TemplateSchema } from '../schemas/template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule { }
