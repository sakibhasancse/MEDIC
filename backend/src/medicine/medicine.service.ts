import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from '../schemas/medicine.schema';

@Injectable()
export class MedicineService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) { }

  async search(query: string, limit: number = 10) {
    // Use text search for autocomplete
    const medicines = await this.medicineModel
      .find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' }, usageCount: -1 })
      .limit(limit)
      .exec();

    // If no results, try regex search as fallback
    if (medicines.length === 0) {
      return this.medicineModel
        .find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { genericName: { $regex: query, $options: 'i' } },
          ],
        })
        .sort({ usageCount: -1 })
        .limit(limit)
        .exec();
    }

    return medicines;
  }

  async getRecentMedicines(medicineIds: string[]) {
    return this.medicineModel.find({ _id: { $in: medicineIds } }).exec();
  }

  async create(medicineData: Partial<Medicine>) {
    const medicine = new this.medicineModel(medicineData);
    return medicine.save();
  }

  async incrementUsage(medicineId: string) {
    return this.medicineModel.findByIdAndUpdate(
      medicineId,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
  }

  async seedMedicines() {
    const count = await this.medicineModel.countDocuments();
    if (count > 0) return; // Already seeded

    const commonMedicines = [
      { name: 'Paracetamol', genericName: 'Acetaminophen', strength: '500mg', form: 'tablet', category: 'painkiller' },
      { name: 'Paracetamol Syrup', genericName: 'Acetaminophen', strength: '120mg/5ml', form: 'syrup', category: 'painkiller' },
      { name: 'Omeprazole', genericName: 'Omeprazole', strength: '20mg', form: 'capsule', category: 'antacid' },
      { name: 'Amoxicillin', genericName: 'Amoxicillin', strength: '500mg', form: 'capsule', category: 'antibiotic' },
      { name: 'Azithromycin', genericName: 'Azithromycin', strength: '500mg', form: 'tablet', category: 'antibiotic' },
      { name: 'Cetirizine', genericName: 'Cetirizine', strength: '10mg', form: 'tablet', category: 'antihistamine' },
      { name: 'Metformin', genericName: 'Metformin', strength: '500mg', form: 'tablet', category: 'antidiabetic' },
      { name: 'Amlodipine', genericName: 'Amlodipine', strength: '5mg', form: 'tablet', category: 'antihypertensive' },
      { name: 'Losartan', genericName: 'Losartan', strength: '50mg', form: 'tablet', category: 'antihypertensive' },
      { name: 'Atorvastatin', genericName: 'Atorvastatin', strength: '20mg', form: 'tablet', category: 'statin' },
      { name: 'Ibuprofen', genericName: 'Ibuprofen', strength: '400mg', form: 'tablet', category: 'painkiller' },
      { name: 'Montelukast', genericName: 'Montelukast', strength: '10mg', form: 'tablet', category: 'antiallergic' },
      { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', strength: '100mcg', form: 'inhaler', category: 'bronchodilator' },
      { name: 'Ranitidine', genericName: 'Ranitidine', strength: '150mg', form: 'tablet', category: 'antacid' },
      { name: 'Ciprofloxacin', genericName: 'Ciprofloxacin', strength: '500mg', form: 'tablet', category: 'antibiotic' },
    ];

    await this.medicineModel.insertMany(commonMedicines);
  }
}
