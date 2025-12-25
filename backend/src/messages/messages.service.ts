import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { DoctorProfileService } from '../doctor-profile/doctor-profile.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private doctorProfileService: DoctorProfileService,
  ) { }

  async create(createMessageDto: CreateMessageDto, senderId: string, senderModel: 'Patient' | 'User'): Promise<Message> {
    const newMessage = new this.messageModel({
      ...createMessageDto,
      senderId: new Types.ObjectId(senderId),
      senderModel,
      receiverId: new Types.ObjectId(createMessageDto.receiverId),
      status: 'sent',
    });
    return newMessage.save();
  }

  async getThreads(userId: string): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);

    const messages = await this.messageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: ['$senderId', '$receiverId'] },
              { p1: '$senderId', p2: '$receiverId' },
              { p1: '$receiverId', p2: '$senderId' },
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]).exec();

    // Fetch doctor profiles for each thread simultaneously
    const threadPromises = messages.map(async m => {
      const otherId = m.lastMessage.senderId.toString() === userId
        ? m.lastMessage.receiverId
        : m.lastMessage.senderId;

      const doctorProfile = await this.doctorProfileService.findByUserId(otherId.toString());

      return {
        id: otherId.toString(),
        lastMessage: m.lastMessage.content,
        timestamp: m.lastMessage.createdAt,
        unreadCount: 0,
        otherParticipantId: otherId.toString(),
        doctorName: doctorProfile?.name || 'Doctor',
        avatar: doctorProfile?.name ? doctorProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DR',
        online: true,
      };
    });

    return Promise.all(threadPromises);
  }

  async getThreadMessages(userId: string, otherId: string): Promise<Message[]> {
    const userObjectId = new Types.ObjectId(userId);
    const otherObjectId = new Types.ObjectId(otherId);

    return this.messageModel
      .find({
        $or: [
          { senderId: userObjectId, receiverId: otherObjectId },
          { senderId: otherObjectId, receiverId: userObjectId },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async markAsRead(messageId: string): Promise<Message> {
    return this.messageModel.findByIdAndUpdate(messageId, { status: 'read' }, { new: true }).exec() as Promise<Message>;
  }
}
