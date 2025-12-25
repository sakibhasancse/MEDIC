import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital', index: true })
  clinicId: Types.ObjectId; // Assuming Hospital acts as Clinic

  @Prop({ required: true })
  date: string; // ISO Date string or format used in frontend (e.g. "Dec 28, 2025")

  @Prop({ required: true })
  time: string; // e.g. "10:30 AM"

  @Prop({ required: true, enum: ['online', 'physical'], default: 'physical' })
  visitType: string;

  @Prop({ required: true, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' })
  status: string;

  @Prop()
  notes: string; // Patient notes

  @Prop()
  meetingLink: string; // For online visits
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ patientId: 1, date: -1 });
AppointmentSchema.index({ doctorId: 1, date: -1 });
