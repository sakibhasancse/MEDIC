import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical-record.schema';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
  ) { }

  async create(patientId: string, createDto: CreateMedicalRecordDto, fileUrl: string): Promise<MedicalRecord> {
    const newRecord = new this.medicalRecordModel({
      ...createDto,
      patientId: new Types.ObjectId(patientId),
      fileUrl,
      date: new Date(createDto.date),
    });
    return newRecord.save();
  }

  async findAllByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ date: -1 })
      .exec();
  }

  async remove(id: string, patientId: string): Promise<void> {
    const result = await this.medicalRecordModel.deleteOne({
      _id: new Types.ObjectId(id),
      patientId: new Types.ObjectId(patientId),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Medical record not found');
    }
  }
}
