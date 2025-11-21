import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicineDocument = Medicine & Document;

@Schema({ timestamps: true })
export class Medicine {
  @Prop({ required: true, index: 'text' })
  name: string;

  @Prop({ index: 'text' })
  genericName: string;

  @Prop()
  strength: string;

  @Prop({ enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'] })
  form: string;

  @Prop({ type: [String], default: ['1+1+1', '1+0+1', '0+1+0', 'SOS'] })
  commonDoses: string[];

  @Prop()
  category: string; // antibiotic, painkiller, antacid, etc.

  @Prop({ default: 0 })
  usageCount: number; // Track popularity
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);

// Create text index for fast autocomplete search
MedicineSchema.index({ name: 'text', genericName: 'text' });
