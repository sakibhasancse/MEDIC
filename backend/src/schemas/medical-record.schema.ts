import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true, enum: ['prescription', 'report', 'other'] })
  recordType: string;

  @Prop()
  doctorName?: string;

  @Prop()
  clinicName?: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  notes?: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
