import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrintTemplate, PrintTemplateDocument } from '../schemas/print-template.schema';

@Injectable()
export class PrintTemplateService {
  constructor(
    @InjectModel(PrintTemplate.name)
    private printTemplateModel: Model<PrintTemplateDocument>,
  ) { }

  async findAll(): Promise<PrintTemplate[]> {
    return this.printTemplateModel.find().exec();
  }

  async findOne(id: string): Promise<PrintTemplate | null> {
    return this.printTemplateModel.findById(id).exec();
  }

  async create(createTemplateDto: any): Promise<PrintTemplate> {
    const createdTemplate = new this.printTemplateModel(createTemplateDto);
    return createdTemplate.save();
  }

  async seedDefaults() {
    const count = await this.printTemplateModel.countDocuments();
    if (count > 0) return;

    const defaults = [
      {
        name: 'Classic',
        description: 'Traditional prescription layout with simple header and footer.',
        isSystem: true,
        cssContent: `
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .doctor-name { font-size: 24px; font-weight: bold; }
          .doctor-degrees { font-size: 14px; }
          .patient-info { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
          .content { display: flex; gap: 20px; }
          .left-column { width: 30%; border-right: 1px solid #eee; padding-right: 10px; }
          .right-column { width: 70%; }
          .footer { margin-top: 50px; border-top: 2px solid #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 12px; }
        `,
        htmlContent: `
          <div class="header">
            <div class="doctor-name">{{doctor.name}}</div>
            <div class="doctor-degrees">{{doctor.degrees}}</div>
            <div>{{doctor.bmdc}}</div>
            <div>{{hospital.name}}</div>
          </div>
          <div class="patient-info">
            <div>Name: {{patient.name}}</div>
            <div>Age: {{patient.age}} | Gender: {{patient.gender}}</div>
            <div>Date: {{date}}</div>
          </div>
          <div class="content">
            <div class="left-column">{{content.left}}</div>
            <div class="right-column">
              <div class="rx-symbol" style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            <div>{{hospital.address}}</div>
            <div>Next Visit: {{nextVisit}}</div>
            <div>{{showTime}}</div>
          </div>
        `
      },
      {
        name: 'Modern',
        description: 'Clean and modern layout with side-by-side header.',
        isSystem: true,
        cssContent: `
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
          .doctor-info { text-align: right; }
          .doctor-name { font-size: 26px; font-weight: bold; color: #2563eb; }
          .hospital-info { text-align: left; }
          .patient-info { background: #f3f4f6; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 25px; }
          .content { display: flex; gap: 30px; }
          .left-column { width: 35%; background: #f9fafb; padding: 15px; border-radius: 8px; }
          .right-column { width: 65%; }
          .footer { margin-top: 40px; background: #2563eb; color: white; padding: 15px; display: flex; justify-content: space-between; border-radius: 8px; }
        `,
        htmlContent: `
          <div class="header">
            <div class="hospital-info">
              <div style="font-size: 20px; font-weight: bold;">{{hospital.name}}</div>
              <div>{{hospital.phone}}</div>
            </div>
            <div class="doctor-info">
              <div class="doctor-name">{{doctor.name}}</div>
              <div>{{doctor.degrees}}</div>
            </div>
          </div>
          <div class="patient-info">
            <div><strong>Patient:</strong> {{patient.name}}</div>
            <div><strong>Age:</strong> {{patient.age}}</div>
            <div><strong>Date:</strong> {{date}}</div>
          </div>
          <div class="content">
            <div class="left-column">{{content.left}}</div>
            <div class="right-column">
              <div style="font-size: 30px; color: #2563eb; margin-bottom: 15px;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            <div>{{hospital.address}}</div>
            <div>Next Visit: {{nextVisit}}</div>
          </div>
        `
      }
    ];

    await this.printTemplateModel.insertMany(defaults);
  }
}
