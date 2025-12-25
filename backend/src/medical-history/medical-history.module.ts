import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistoryService } from './medical-history.service';
import { Prescription, PrescriptionSchema } from '../schemas/prescription.schema';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { DoctorProfileModule } from '../doctor-profile/doctor-profile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    DoctorProfileModule,
  ],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
})
export class MedicalHistoryModule { }
