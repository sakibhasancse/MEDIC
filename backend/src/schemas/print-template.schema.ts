import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrintTemplateDocument = PrintTemplate & Document;

@Schema({ timestamps: true })
export class PrintTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  thumbnail: string; // URL or Base64

  @Prop({ required: true })
  htmlContent: string; // HTML with {{placeholders}}

  @Prop({ required: true })
  cssContent: string; // CSS styles

  @Prop({ default: false })
  isSystem: boolean; // true for built-in templates

  @Prop()
  createdBy: string; // Optional: ID of user who created it

  @Prop({ type: Object })
  colorScheme: {
    primary: string;
    accent: string;
    background: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId; // For custom templates

  @Prop({ default: 'classic' })
  category: string; // 'classic', 'modern', 'minimal', etc.

  @Prop()
  baseTemplateId: string; // Reference to original template if this is a color variant

  @Prop({ type: Object })
  layout: {
    header: {
      elements: Array<{
        id: string;
        type: 'text' | 'image' | 'logo' | 'placeholder';
        content: string;
        dataField?: string; // e.g., 'doctor.name', 'hospital.address'
        position: { x: number; y: number };
        size: { width: number; height: number };
        style: {
          fontSize: number;
          fontFamily: string;
          color: string;
          align: 'left' | 'center' | 'right';
          bold: boolean;
          italic: boolean;
        };
      }>;
      background: {
        type: 'color' | 'image';
        value: string;
      };
      height: number;
    };
    footer: {
      elements: Array<{
        id: string;
        type: 'text' | 'image' | 'logo' | 'placeholder';
        content: string;
        dataField?: string;
        position: { x: number; y: number };
        size: { width: number; height: number };
        style: {
          fontSize: number;
          fontFamily: string;
          color: string;
          align: 'left' | 'center' | 'right';
          bold: boolean;
          italic: boolean;
        };
      }>;
      background: {
        type: 'color' | 'image';
        value: string;
      };
      height: number;
    };
    body: {
      sections: Array<{
        id: string;
        type: 'patient-info' | 'medicines' | 'advice' | 'diagnosis' | 'custom-text' | 'divider';
        position: { x: number; y: number };
        size: { width: number; height: number };
        content?: string;
        style?: {
          fontSize: number;
          fontFamily: string;
          color: string;
        };
      }>;
      background: {
        type: 'color' | 'image';
        value: string;
      };
    };
  };


  @Prop({ type: Object })
  design: {
    elements: any[];
    printLayout: {
      pageSize: 'A4' | 'A5';
      orientation: 'portrait' | 'landscape';
      margins: { top: number; right: number; bottom: number; left: number };
    };
    canvasBg: string;
  };
}

export const PrintTemplateSchema = SchemaFactory.createForClass(PrintTemplate);
