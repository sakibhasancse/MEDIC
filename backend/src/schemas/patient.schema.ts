import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  phone: string;

  @Prop()
  age: number;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop()
  address: string;

  @Prop({ type: [String], default: [] })
  chronicDiseases: string[];

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop()
  bloodGroup: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

// Create compound index for phone + doctorId for fast lookups
PatientSchema.index({ phone: 1, doctorId: 1 }, { unique: true });
