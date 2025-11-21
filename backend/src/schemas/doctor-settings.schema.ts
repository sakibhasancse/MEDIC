import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorSettingsDocument = DoctorSettings & Document;

@Schema({ timestamps: true })
export class DoctorSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  doctorId: Types.ObjectId;

  // Prescription Header
  @Prop({ type: Object })
  prescriptionHeader: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string; // base64 or URL
    position?: { x: number; y: number }; // for drag positioning
  };

  // Prescription Footer
  @Prop({ type: Object })
  prescriptionFooter: {
    text?: string;
    position?: { x: number; y: number };
  };

  // Digital Signature
  @Prop()
  signature: string; // base64 image

  @Prop({ type: Object })
  signaturePosition: {
    x: number;
    y: number;
  };

  // Default Medicines
  @Prop({ type: [Object], default: [] })
  defaultMedicines: Array<{
    name: string;
    dose: string;
    duration: string;
    instructions: string;
  }>;

  // Default Tests
  @Prop({ type: [String], default: [] })
  defaultTests: string[];

  // Default Advice
  @Prop({ type: [String], default: [] })
  defaultAdvice: string[];

  // Recently Used Medicines (IDs)
  @Prop({ type: [String], default: [] })
  recentMedicineIds: string[];

  // Preferences
  @Prop({ default: 'en', enum: ['en', 'bn'] })
  defaultLanguage: string;

  @Prop({ type: [String], default: ['1+1+1', '1+0+1', '0+1+0', 'SOS'] })
  dosePresets: string[];
}

export const DoctorSettingsSchema = SchemaFactory.createForClass(DoctorSettings);
