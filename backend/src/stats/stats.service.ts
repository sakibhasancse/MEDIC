import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { Patient, PatientDocument } from '../schemas/patient.schema';
import { Template, TemplateDocument } from '../schemas/template.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) { }

  async getDashboardStats(doctorId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      prescriptionsToday,
      prescriptionsThisWeek,
      prescriptionsThisMonth,
      totalPrescriptions,
      totalPatients,
      totalTemplates,
      recentPrescriptions,
    ] = await Promise.all([
      this.prescriptionModel.countDocuments({
        doctorId,
        createdAt: { $gte: startOfToday },
      }),
      this.prescriptionModel.countDocuments({
        doctorId,
        createdAt: { $gte: startOfWeek },
      }),
      this.prescriptionModel.countDocuments({
        doctorId,
        createdAt: { $gte: startOfMonth },
      }),
      this.prescriptionModel.countDocuments({ doctorId }),
      this.patientModel.countDocuments({ doctorId }),
      this.templateModel.countDocuments({ doctorId }),
      this.prescriptionModel
        .find({ doctorId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('patientId', 'name phone')
        .exec(),
    ]);

    return {
      prescriptionsToday,
      prescriptionsThisWeek,
      prescriptionsThisMonth,
      totalPrescriptions,
      totalPatients,
      totalTemplates,
      recentPrescriptions,
    };
  }
}
