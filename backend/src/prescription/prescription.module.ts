import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { Prescription, PrescriptionSchema } from '../schemas/prescription.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Patient, PatientSchema } from '../schemas/patient.schema';
import { PrintTemplateModule } from '../print-template/print-template.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
    PrintTemplateModule,
  ],
  providers: [PrescriptionService],
  controllers: [PrescriptionController],
  exports: [PrescriptionService],
})
export class PrescriptionModule { }
