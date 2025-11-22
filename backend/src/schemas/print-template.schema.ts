import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const PrintTemplateSchema = SchemaFactory.createForClass(PrintTemplate);
