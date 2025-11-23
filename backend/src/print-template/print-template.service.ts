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

  async cloneWithColors(id: string, colorScheme: any): Promise<PrintTemplate> {
    const template = await this.printTemplateModel.findById(id).lean().exec();
    if (!template) {
      throw new Error('Template not found');
    }

    const cloned = new this.printTemplateModel({
      ...template,
      _id: undefined,
      name: `${template.name} - Custom`,
      colorScheme,
      baseTemplateId: id,
      isSystem: false,
    });

    return cloned.save();
  }

  async findByDoctor(doctorId: string): Promise<PrintTemplate[]> {
    return this.printTemplateModel.find({ doctorId }).exec();
  }

  async updateLayout(id: string, layout: any): Promise<PrintTemplate> {
    const template = await this.printTemplateModel.findByIdAndUpdate(
      id,
      { layout },
      { new: true }
    ).exec();

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async update(id: string, updateDto: any): Promise<PrintTemplate> {
    const template = await this.printTemplateModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true }
    ).exec();

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async getPreviewData(id: string): Promise<any> {
    const template = await this.findOne(id);

    if (!template) {
      throw new Error('Template not found');
    }

    // Return template with dummy data for preview
    return {
      template,
      dummyData: {
        patient: {
          name: 'John Doe',
          age: 35,
          gender: 'Male',
          phone: '01712345678'
        },
        medicines: [
          { name: 'Tab. Paracetamol 500mg', dose: '1+0+1', duration: '5 days', instructions: 'After meal' },
          { name: 'Cap. Omeprazole 20mg', dose: '0+0+1', duration: '7 days', instructions: 'Before meal' },
          { name: 'Syp. Antacid', dose: '2 tsp', duration: '3 days', instructions: 'When needed' }
        ],
        advice: [
          'Take adequate rest',
          'Drink plenty of water',
          'Avoid oily and spicy food',
          'Complete the full course of medicine'
        ],
        diagnosis: ['Fever', 'Headache', 'Body ache'],
        tests: ['CBC', 'X-Ray Chest']
      }
    };
  }

  async delete(id: string): Promise<{ message: string; id: string }> {
    const result = await this.printTemplateModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new Error('Template not found');
    }

    return {
      message: 'Template deleted successfully',
      id
    };
  }

  async seedDefaults() {
    const count = await this.printTemplateModel.countDocuments();
    if (count > 0) return;

    const colorVariants = [
      { name: 'Blue', primary: '#2563eb', accent: '#3b82f6', background: '#eff6ff' },
      { name: 'Green', primary: '#059669', accent: '#10b981', background: '#ecfdf5' },
      { name: 'Purple', primary: '#7c3aed', accent: '#8b5cf6', background: '#f5f3ff' },
      { name: 'Red', primary: '#dc2626', accent: '#ef4444', background: '#fef2f2' },
    ];

    const baseTemplates = [
      {
        name: 'Classic',
        description: 'Traditional prescription layout with simple header and footer.',
        category: 'classic',
        isSystem: true,
        cssContent: `
          .header { text-align: center; border-bottom: 2px solid var(--primary-color, #000); padding-bottom: 10px; margin-bottom: 20px; }
          .doctor-name { font-size: 24px; font-weight: bold; color: var(--primary-color, #000); }
          .doctor-degrees { font-size: 14px; color: var(--accent-color, #333); }
          .patient-info { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
          .content { display: flex; gap: 20px; }
          .left-column { width: 30%; border-right: 1px solid #eee; padding-right: 10px; }
          .right-column { width: 70%; }
          .footer { margin-top: 50px; border-top: 2px solid var(--primary-color, #000); padding-top: 10px; display: flex; justify-content: space-between; font-size: 12px; }
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
        category: 'modern',
        isSystem: true,
        cssContent: `
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--primary-color, #2563eb); padding-bottom: 15px; margin-bottom: 25px; }
          .doctor-info { text-align: right; }
          .doctor-name { font-size: 26px; font-weight: bold; color: var(--primary-color, #2563eb); }
          .hospital-info { text-align: left; }
          .patient-info { background: var(--background-color, #f3f4f6); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 25px; }
          .content { display: flex; gap: 30px; }
          .left-column { width: 35%; background: #f9fafb; padding: 15px; border-radius: 8px; }
          .right-column { width: 65%; }
          .footer { margin-top: 40px; background: var(--primary-color, #2563eb); color: white; padding: 15px; display: flex; justify-content: space-between; border-radius: 8px; }
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
              <div style="font-size: 30px; color: var(--primary-color, #2563eb); margin-bottom: 15px;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            <div>{{hospital.address}}</div>
            <div>Next Visit: {{nextVisit}}</div>
          </div>
        `
      },
      {
        name: 'Minimal',
        description: 'Minimalist design with clean lines and ample white space.',
        category: 'minimal',
        isSystem: true,
        cssContent: `
          .header { border-bottom: 1px solid var(--accent-color, #e5e7eb); padding-bottom: 20px; margin-bottom: 30px; }
          .doctor-name { font-size: 22px; font-weight: 600; color: var(--primary-color, #1f2937); margin-bottom: 5px; }
          .doctor-degrees { font-size: 13px; color: #6b7280; }
          .patient-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 30px; }
          .patient-info > div { font-size: 14px; }
          .content { display: flex; gap: 40px; }
          .left-column { width: 35%; }
          .right-column { width: 65%; }
          .footer { margin-top: 60px; padding-top: 15px; border-top: 1px solid var(--accent-color, #e5e7eb); font-size: 12px; color: #6b7280; text-align: center; }
        `,
        htmlContent: `
          <div class="header">
            <div class="doctor-name">{{doctor.name}}</div>
            <div class="doctor-degrees">{{doctor.degrees}}</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">{{doctor.bmdc}} | {{hospital.name}}</div>
          </div>
          <div class="patient-info">
            <div><strong>Patient:</strong> {{patient.name}}</div>
            <div><strong>Age/Gender:</strong> {{patient.age}}, {{patient.gender}}</div>
            <div><strong>Date:</strong> {{date}}</div>
          </div>
          <div class="content">
            <div class="left-column">{{content.left}}</div>
            <div class="right-column">
              <div style="font-size: 28px; font-weight: 300; color: var(--primary-color, #1f2937); margin-bottom: 20px;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            <div>{{hospital.address}} | {{hospital.phone}}</div>
            <div style="margin-top: 5px;">Next Visit: {{nextVisit}} | {{showTime}}</div>
          </div>
        `
      }
    ];

    const templates: any[] = [];
    for (const baseTemplate of baseTemplates) {
      for (const variant of colorVariants) {
        templates.push({
          ...baseTemplate,
          name: `${baseTemplate.name} - ${variant.name}`,
          colorScheme: {
            primary: variant.primary,
            accent: variant.accent,
            background: variant.background,
          },
          cssContent: baseTemplate.cssContent
            .replace(/var\(--primary-color, [^)]+\)/g, variant.primary)
            .replace(/var\(--accent-color, [^)]+\)/g, variant.accent)
            .replace(/var\(--background-color, [^)]+\)/g, variant.background),
        });
      }
    }

    await this.printTemplateModel.insertMany(templates);
  }
}
