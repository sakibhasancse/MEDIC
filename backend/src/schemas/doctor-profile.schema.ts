import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorProfileDocument = DoctorProfile & Document;

@Schema({ timestamps: true })
export class DoctorProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  nameBangla: string;

  @Prop({ type: [String], default: [] })
  degrees: string[];

  @Prop({ type: [String], default: [] })
  degreesBangla: string[];

  @Prop()
  specialization: string;

  @Prop()
  bmdcNumber: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  signature: string; // base64

  @Prop()
  avatar: string; // base64 or URL

  @Prop()
  profileImage: string; // URL from S3/MinIO

  @Prop()
  lifeHistory: string; // Rich text HTML

  @Prop()
  address: string;

  @Prop()
  chamber: string;

  @Prop({ type: Object, default: {} })
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };

  @Prop()
  experience: number; // Years of experience

  @Prop({ type: [String], default: [] })
  hospitalAffiliations: string[];
}

export const DoctorProfileSchema = SchemaFactory.createForClass(DoctorProfile);
