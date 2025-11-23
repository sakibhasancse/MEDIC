import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HospitalDocument = Hospital & Document;

@Schema({ timestamps: true })
export class Hospital {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Types.ObjectId, ref: 'PrintTemplate' })
  defaultPrintTemplateId: Types.ObjectId;

  // Header Configuration
  @Prop({ default: 'structured', enum: ['richtext', 'structured'] })
  headerMode: string;

  @Prop()
  headerRichText: string; // HTML from rich text editor

  @Prop({ type: Object })
  headerStructured: {
    clinicName?: string;
    clinicNameBangla?: string;
    address?: string;
    addressBangla?: string;
    phone?: string;
    email?: string;
    logo?: string; // base64
    additionalFields?: Array<{ label: string; value: string }>;
  };

  // Body Settings
  @Prop({ type: Object, default: {} })
  bodySettings: {
    fontFamily?: string;
    fontSize?: number;
    lineSpacing?: number;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };

  // Footer Configuration
  @Prop({ default: 'structured', enum: ['richtext', 'structured'] })
  footerMode: string;

  @Prop()
  footerRichText: string; // HTML from rich text editor

  @Prop({ type: Object })
  footerStructured: {
    text: string;
    textBangla?: string;
    additionalFields?: Array<{ label: string; value: string }>;
  };

  // Doctor Information
  @Prop({ type: Object, default: {} })
  doctorInfo: {
    name: string;
    nameInBangla?: string;
    degrees: string[];
    degreesBangla?: string[];
    emails: string[];
    bmdcNumber?: string;
  };

  @Prop()
  doctorInfoRichText: string;

  @Prop()
  doctorInfoRichTextBangla: string;

  @Prop()
  hospitalInfoRichText: string;

  @Prop()
  hospitalInfoRichTextBangla: string;

  // Footer Settings
  @Prop({ type: Object, default: {} })
  footerSettings: {
    showTime: string;
    defaultNextVisitDay: string;
  };

  // Print Layout Preferences
  @Prop({
    type: Object,
    default: {
      leftColumn: ['tests', 'advice', 'physicalExamination'],
      rightColumn: ['medicines'],
    },
  })
  printLayout: {
    leftColumn: string[];
    rightColumn: string[];
  };

  // Signature
  @Prop()
  signature: string; // base64 image

  @Prop({ type: Object })
  signaturePosition: {
    x?: number;
    y?: number;
  };
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);

// Index for faster queries
HospitalSchema.index({ doctorId: 1, isDefault: 1 });
