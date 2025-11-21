import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeatureSettings, FeatureSettingsDocument } from '../schemas/feature-settings.schema';

@Injectable()
export class FeatureSettingsService {
  constructor(
    @InjectModel(FeatureSettings.name) private featureSettingsModel: Model<FeatureSettingsDocument>,
  ) { }

  async getSettings(doctorId: string) {
    // Use findOneAndUpdate with upsert to avoid duplicate key errors
    const settings = await this.featureSettingsModel.findOneAndUpdate(
      { doctorId },
      {
        $setOnInsert: {
          doctorId,
          enabledSections: {
            chiefComplaint: true,
            historyOfPresentIllness: true,
            previousLabReports: true,
            physicalExamination: true,
            vitalSigns: true,
            diagnosis: true,
            medicines: true,
            tests: true,
            advice: true,
            nextVisit: true,
          },
          printSettings: {
            printBodyOnly: false,
            fontSize: 12,
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            lineSpacing: 1.15,
            paperSize: 'A4',
            orientation: 'portrait',
          },
        },
      },
      { new: true, upsert: true }
    );

    return settings;
  }

  async updateSettings(doctorId: string, updateData: Partial<FeatureSettings>) {
    return this.featureSettingsModel.findOneAndUpdate(
      { doctorId },
      { $set: updateData },
      { new: true, upsert: true }
    );
  }
}
