import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorProfile, DoctorProfileDocument } from '../schemas/doctor-profile.schema';

@Injectable()
export class DoctorProfileService {
  constructor(
    @InjectModel(DoctorProfile.name)
    private doctorProfileModel: Model<DoctorProfileDocument>,
  ) { }

  async createOrUpdate(userId: string, profileData: any): Promise<DoctorProfile | null> {
    const existingProfile = await this.doctorProfileModel.findOne({ userId });

    if (existingProfile) {
      return await this.doctorProfileModel.findByIdAndUpdate(
        existingProfile._id,
        { ...profileData },
        { new: true }
      ).exec();
    }

    const newProfile = new this.doctorProfileModel({
      userId,
      ...profileData,
    });
    return newProfile.save();
  }

  async findByUserId(userId: string): Promise<DoctorProfile | null> {
    return this.doctorProfileModel.findOne({ userId }).exec();
  }
}
