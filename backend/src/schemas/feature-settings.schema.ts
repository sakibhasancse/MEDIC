import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeatureSettingsDocument = FeatureSettings & Document;

@Schema({ timestamps: true })
export class FeatureSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  doctorId: Types.ObjectId;

  // Enabled Sections
  @Prop({ type: Object, default: {} })
  enabledSections: {
    chiefComplaint?: boolean;
    historyOfPresentIllness?: boolean;
    previousLabReports?: boolean;
    physicalExamination?: boolean;
    vitalSigns?: boolean;
    diagnosis?: boolean;
    medicines?: boolean;
    tests?: boolean;
    advice?: boolean;
    nextVisit?: boolean;
  };

  // Print Settings
  @Prop({ type: Object, default: {} })
  printSettings: {
    printBodyOnly?: boolean;
    fontSize?: number;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    lineSpacing?: number;
    paperSize?: string; // 'A4' | 'Letter'
    orientation?: string; // 'portrait' | 'landscape'
  };
}

export const FeatureSettingsSchema = SchemaFactory.createForClass(FeatureSettings);
