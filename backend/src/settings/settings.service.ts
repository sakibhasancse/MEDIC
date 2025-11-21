import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorSettings, DoctorSettingsDocument } from '../schemas/doctor-settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(DoctorSettings.name) private settingsModel: Model<DoctorSettingsDocument>,
  ) { }

  async getSettings(doctorId: string) {
    let settings = await this.settingsModel.findOne({ doctorId });

    // Create default settings if not exists
    if (!settings) {
      settings = new this.settingsModel({
        doctorId,
        defaultAdvice: [
          'Take after meal',
          'Drink plenty of water',
          'Avoid oily food',
          'Rest properly',
          'Complete the course',
        ],
        defaultTests: [],
        defaultMedicines: [],
        dosePresets: ['1+1+1', '1+0+1', '0+1+0', '1+0+0', '0+0+1', 'SOS'],
      });
      await settings.save();
    }

    return settings;
  }

  async updateSettings(doctorId: string, updateData: Partial<DoctorSettings>) {
    return this.settingsModel.findOneAndUpdate(
      { doctorId },
      { $set: updateData },
      { new: true, upsert: true }
    );
  }

  async addRecentMedicine(doctorId: string, medicineId: string) {
    const settings = await this.getSettings(doctorId);

    // Add to front, remove duplicates, keep last 20
    const recentIds = [medicineId, ...settings.recentMedicineIds.filter(id => id !== medicineId)].slice(0, 20);

    settings.recentMedicineIds = recentIds;
    await settings.save();

    return settings;
  }
}
