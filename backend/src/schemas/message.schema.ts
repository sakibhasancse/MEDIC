import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  senderId: Types.ObjectId;

  @Prop({ required: true, enum: ['Patient', 'User'] })
  senderModel: string; // 'Patient' or 'User' (Doctor)

  @Prop({ type: Types.ObjectId, required: true, index: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true, enum: ['Patient', 'User'] })
  receiverModel: string;

  @Prop({ required: true })
  content: string;

  @Prop([String])
  attachments: string[];

  @Prop({ required: true, enum: ['sent', 'delivered', 'read'], default: 'sent' })
  status: string;

  @Prop({ type: Types.ObjectId, index: true })
  threadId: Types.ObjectId; // Optional: if we want explicit threading. Or we can group by participants. 
  // For simplicity, let's use a composite logic for threading or a Thread schema.
  // But a simple "threadId" string representing "minId_maxId" of participants works too.
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ createdAt: -1 });
