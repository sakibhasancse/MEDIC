import { Controller, Get, Post, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  async create(@Request() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    // req.user.userId is treated as the patientId
    return this.appointmentsService.create(createAppointmentDto, req.user.userId);
  }

  @Get('patient')
  async findAllByPatient(@Request() req) {
    return this.appointmentsService.findAllByPatient(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id/reschedule')
  async reschedule(@Param('id') id: string, @Body() body: { date: string; time: string }) {
    return this.appointmentsService.reschedule(id, body.date, body.time);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}
