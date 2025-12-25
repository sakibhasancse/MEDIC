import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, unique: true })
  email?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: true })
  phone?: string;

  @Prop()
  specialization: string;

  @Prop({ type: Object })
  prescriptionHeader: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };

  @Prop({ type: Object })
  prescriptionFooter: {
    text?: string;
  };

  @Prop()
  signature: string; // base64 image

  @Prop({ type: [String], default: [] })
  defaultAdvice: string[];

  @Prop({ type: [String], default: ['1+1+1', '1+0+1', '0+1+0', 'SOS'] })
  defaultDoses: string[];

  @Prop({ default: 'en', enum: ['en', 'bn'] })
  language: string;

  @Prop({ type: [String], default: [] })
  recentMedicines: string[]; // Store medicine IDs
}

export const UserSchema = SchemaFactory.createForClass(User);
