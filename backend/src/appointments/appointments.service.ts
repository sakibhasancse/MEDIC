import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) { }

  async create(createAppointmentDto: CreateAppointmentDto, patientId: string): Promise<Appointment> {
    const newAppointment = new this.appointmentModel({
      ...createAppointmentDto,
      patientId: new Types.ObjectId(patientId),
      clinicId: new Types.ObjectId(createAppointmentDto.clinicId),
      doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
      status: 'scheduled',
    });
    return newAppointment.save();
  }

  async findAllByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ date: -1 })
      .populate('clinicId', 'name address') // Assuming Hospital schema has name/address
      .populate('doctorId', 'name specialization') // Assuming User/Doctor schema has these
      .exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('clinicId', 'name address')
      .populate('doctorId', 'name specialization')
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async reschedule(id: string, date: string, time: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findByIdAndUpdate(
        id,
        { date, time },
        { new: true }
      )
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true }
      )
      .exec();

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }
}
