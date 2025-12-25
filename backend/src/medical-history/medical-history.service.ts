import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { DoctorProfileService } from '../doctor-profile/doctor-profile.service';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private doctorProfileService: DoctorProfileService,
  ) { }

  async getTimeline(patientId: string): Promise<any[]> {
    const patientObjectId = new Types.ObjectId(patientId);

    const [prescriptions, appointments] = await Promise.all([
      this.prescriptionModel.find({ patientId: patientObjectId }).exec(),
      this.appointmentModel.find({ patientId: patientObjectId }).exec(),
    ]);

    const prescriptionTimelineItems = await Promise.all(
      prescriptions.map(async p => {
        const doctorProfile = await this.doctorProfileService.findByUserId(p.doctorId.toString());
        return {
          id: p._id,
          type: 'prescription',
          title: `Prescription: ${p.diagnosis || 'General'}`,
          subtitle: doctorProfile?.name || 'Doctor',
          date: (p as any).createdAt,
          data: p,
        };
      })
    );

    const appointmentTimelineItems = await Promise.all(
      appointments.map(async a => {
        const doctorProfile = await this.doctorProfileService.findByUserId(a.doctorId.toString());
        return {
          id: a._id,
          type: 'appointment',
          title: `Appointment: ${a.visitType === 'online' ? 'Online' : 'Physical'}`,
          subtitle: doctorProfile?.name ? `Dr. ${doctorProfile.name} (Status: ${a.status})` : `Status: ${a.status}`,
          date: new Date(a.date).toISOString(),
          data: a,
        };
      })
    );

    const timeline = [...prescriptionTimelineItems, ...appointmentTimelineItems];

    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
