import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from '../schemas/template.schema';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) { }

  async create(doctorId: string, templateData: Partial<Template>) {
    const template = new this.templateModel({
      ...templateData,
      doctorId,
    });
    return template.save();
  }

  async findAll(doctorId: string) {
    return this.templateModel.find({
      $or: [{ doctorId }, { isPublic: true }],
    }).exec();
  }

  async findById(id: string) {
    return this.templateModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<Template>) {
    return this.templateModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(id: string) {
    return this.templateModel.findByIdAndDelete(id).exec();
  }
}
