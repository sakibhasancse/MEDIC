import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../schemas/patient.schema';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) { }

  async findOrCreateByPhone(phone: string, doctorId: string, patientData?: Partial<Patient>) {
    let patient = await this.patientModel.findOne({ phone, doctorId });

    if (!patient && patientData) {
      patient = new this.patientModel({
        ...patientData,
        phone,
        doctorId,
      });
      await patient.save();
    } else if (patient && patientData) {
      // Update existing patient
      Object.assign(patient, patientData);
      await patient.save();
    }

    return patient;
  }

  async getByPhone(phone: string, doctorId: string) {
    return this.patientModel.findOne({ phone, doctorId });
  }

  async update(patientId: string, updateData: Partial<Patient>) {
    return this.patientModel.findByIdAndUpdate(
      patientId,
      { $set: updateData },
      { new: true }
    );
  }
}
