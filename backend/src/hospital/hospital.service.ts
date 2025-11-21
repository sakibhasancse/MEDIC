import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';

@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
  ) { }

  async create(doctorId: string, hospitalData: Partial<Hospital>) {
    // If this is the first hospital, make it default
    const existingCount = await this.hospitalModel.countDocuments({ doctorId });
    const isDefault = existingCount === 0 || hospitalData.isDefault;

    // If setting as default, unset other defaults
    if (isDefault) {
      await this.hospitalModel.updateMany(
        { doctorId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const hospital = new this.hospitalModel({
      ...hospitalData,
      doctorId,
      isDefault,
    });

    return hospital.save();
  }

  async findAll(doctorId: string) {
    return this.hospitalModel.find({ doctorId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async findById(id: string) {
    return this.hospitalModel.findById(id);
  }

  async findDefault(doctorId: string) {
    return this.hospitalModel.findOne({ doctorId, isDefault: true });
  }

  async update(id: string, updateData: Partial<Hospital>) {
    const hospital = await this.hospitalModel.findById(id);
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await this.hospitalModel.updateMany(
        { doctorId: hospital.doctorId, _id: { $ne: id }, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    return this.hospitalModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async delete(id: string) {
    const hospital = await this.hospitalModel.findById(id);
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    // Don't allow deleting the last hospital
    const count = await this.hospitalModel.countDocuments({ doctorId: hospital.doctorId });
    if (count === 1) {
      throw new Error('Cannot delete the last hospital');
    }

    // If deleting default, make another one default
    if (hospital.isDefault) {
      const nextHospital = await this.hospitalModel.findOne({
        doctorId: hospital.doctorId,
        _id: { $ne: id },
      });
      if (nextHospital) {
        nextHospital.isDefault = true;
        await nextHospital.save();
      }
    }

    return this.hospitalModel.findByIdAndDelete(id);
  }

  async setDefault(doctorId: string, hospitalId: string) {
    // Unset all defaults
    await this.hospitalModel.updateMany(
      { doctorId, isDefault: true },
      { $set: { isDefault: false } }
    );

    // Set new default
    return this.hospitalModel.findByIdAndUpdate(
      hospitalId,
      { $set: { isDefault: true } },
      { new: true }
    );
  }
}
