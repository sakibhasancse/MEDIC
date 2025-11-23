import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GlobalHospitalDocument = GlobalHospital & Document;

@Schema({ timestamps: true })
export class GlobalHospital {
  @Prop({ unique: true })
  id: number;

  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  nameBangla: string;

  @Prop()
  code: string;

  @Prop()
  agency: string;

  @Prop()
  type: string;

  @Prop()
  division: string;

  @Prop()
  district: string;

  @Prop()
  cityCorporation: string;

  @Prop()
  upazila: string;

  @Prop()
  paurasava: string;

  @Prop()
  union: string;

  @Prop()
  private: boolean;
}

export const GlobalHospitalSchema = SchemaFactory.createForClass(GlobalHospital);

// Text index for search
GlobalHospitalSchema.index({ name: 'text', nameBangla: 'text' });
