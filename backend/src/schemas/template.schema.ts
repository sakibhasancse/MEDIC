import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemplateDocument = Template & Document;

class TemplateMedicine {
  @Prop({ required: true })
  name: string;

  @Prop()
  dose: string;

  @Prop()
  duration: string;

  @Prop()
  instructions: string;
}

@Schema({ timestamps: true })
export class Template {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  diagnosis: string;

  @Prop({ type: [TemplateMedicine], default: [] })
  medicines: TemplateMedicine[];

  @Prop({ type: [String], default: [] })
  advice: string[];

  @Prop({ type: [String], default: [] })
  tests: string[];

  @Prop({ default: false })
  isPublic: boolean;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
