import { Controller, Get, Post, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post()
  async create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    // Determine sender model based on auth payload if necessary
    // For now assuming Patient given the context of the Patient Portal
    const senderModel = 'Patient';
    return this.messagesService.create(createMessageDto, req.user.userId, senderModel);
  }

  @Get('threads')
  async getThreads(@Request() req) {
    return this.messagesService.getThreads(req.user.userId);
  }

  @Get('thread/:otherId')
  async getThreadMessages(@Request() req, @Param('otherId') otherId: string) {
    return this.messagesService.getThreadMessages(req.user.userId, otherId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.messagesService.markAsRead(id);
  }
}
