import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

class Medicine {
  @Prop({ required: true })
  name: string;

  @Prop()
  genericName: string;

  @Prop({ required: true })
  dose: string;

  @Prop()
  duration: string;

  @Prop()
  instructions: string;

  @Prop({ default: 0 })
  order: number;
}

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital' })
  hospitalId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  prescriptionNumber: string;

  @Prop()
  chiefComplaint: string;

  @Prop()
  historyOfPresentIllness: string;

  @Prop()
  previousLabReports: string;

  @Prop()
  physicalExamination: string;

  @Prop({ type: Object })
  vitalSigns: {
    bloodPressure?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
    height?: string;
  };

  @Prop()
  diagnosis: string;

  @Prop([Medicine])
  medicines: Medicine[];

  @Prop([String])
  advice: string[];

  @Prop([String])
  tests: string[];

  @Prop()
  nextVisitDuration: string; // e.g., "20 days"

  @Prop({ default: 'en', enum: ['en', 'bn'] })
  language: string;

  @Prop()
  qrCode: string;

  @Prop()
  pdfUrl: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

// Index for fast patient history retrieval
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ prescriptionNumber: 1 });
