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

  async findSystemDefault(): Promise<PrintTemplate | null> {
    return this.printTemplateModel.findOne({ name: 'Classic Vertical Split', isSystem: true }).exec();
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

  async customize(id: string, doctorId: string): Promise<PrintTemplate> {
    const template = await this.printTemplateModel.findById(id).lean().exec();
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if doctor already has a custom version of this template
    const existingCustom = await this.printTemplateModel.findOne({
      doctorId,
      baseTemplateId: id,
      isSystem: false
    }).exec();

    if (existingCustom) {
      return existingCustom;
    }

    const customTemplate = new this.printTemplateModel({
      ...template,
      _id: undefined,
      name: `${template.name} (Custom)`,
      doctorId,
      baseTemplateId: id,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return customTemplate.save();
  }

  async resetToDefault(id: string, doctorId: string): Promise<{ message: string; baseTemplateId: string }> {
    const template = await this.printTemplateModel.findOne({ _id: id, doctorId }).exec();

    if (!template) {
      throw new Error('Custom template not found or access denied');
    }

    if (!template.baseTemplateId) {
      throw new Error('This is not a customized default template');
    }

    await this.printTemplateModel.findByIdAndDelete(id).exec();

    return {
      message: 'Reset to default successfully',
      baseTemplateId: template.baseTemplateId
    };
  }

  async seedDefaults() {
    const count = await this.printTemplateModel.countDocuments({ isSystem: true });
    if (count >= 6) return; // Skip if we already have the default set

    const baseTemplates = [
      {
        name: 'Classic Vertical Split',
        description: 'Traditional layout with clear separation between patient info, history, and prescription.',
        category: 'classic',
        isSystem: true,
        cssContent: `
          .header { text-align: center; border-bottom: 2px solid var(--primary-color, #000); padding-bottom: 10px; margin-bottom: 20px; }
          .doctor-name { font-size: 24px; font-weight: bold; color: var(--primary-color, #000); }
          .doctor-degrees { font-size: 14px; color: var(--accent-color, #333); }
          .patient-info { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; font-size: 14px; }
          .content { display: flex; gap: 20px; min-height: 600px; }
          .left-column { width: 30%; border-right: 1px solid #eee; padding-right: 10px; font-size: 13px; }
          .right-column { width: 70%; padding-left: 10px; }
          .footer { margin-top: auto; border-top: 2px solid var(--primary-color, #000); padding-top: 10px; display: flex; justify-content: space-between; font-size: 12px; }
          .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; font-size: 14px; }
        `,
        htmlContent: `
          <div class="header">
            <div class="doctor-name">{{doctor.name}}</div>
            <div class="doctor-degrees">{{doctor.degrees}}</div>
            <div>{{doctor.bmdc}} | {{hospital.name}}</div>
          </div>
          <div class="patient-info">
            <div>Name: {{patient.name}}</div>
            <div>Age: {{patient.age}} | Gender: {{patient.gender}}</div>
            <div>Date: {{date}}</div>
          </div>
          <div class="content">
            <div class="left-column">
              <div class="section-title">Clinical Findings</div>
              {{content.left}}
            </div>
            <div class="right-column">
              <div class="rx-symbol" style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            <div>{{hospital.address}}</div>
            <div>Next Visit: {{nextVisit}}</div>
            <div>Signature: ________________</div>
          </div>
        `
      },
      {
        name: 'Modern Clean View',
        description: 'Contemporary design with side-by-side header and clean typography.',
        category: 'modern',
        isSystem: true,
        cssContent: `
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--primary-color, #2563eb); padding-bottom: 15px; margin-bottom: 25px; }
          .doctor-info { text-align: right; }
          .doctor-name { font-size: 26px; font-weight: bold; color: var(--primary-color, #2563eb); }
          .hospital-info { text-align: left; }
          .patient-info { background: var(--background-color, #f3f4f6); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; }
          .content { display: flex; gap: 30px; min-height: 550px; }
          .left-column { width: 35%; background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 13px; }
          .right-column { width: 65%; }
          .footer { margin-top: auto; background: var(--primary-color, #2563eb); color: white; padding: 15px; display: flex; justify-content: space-between; border-radius: 8px; font-size: 12px; }
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
            <div class="left-column">
              <strong>Tests & Advice</strong><br/>
              {{content.left}}
            </div>
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
        name: 'Compact Professional',
        description: 'Dense layout optimized for fitting more information on a single page.',
        category: 'professional',
        isSystem: true,
        cssContent: `
          .header { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px; }
          .doctor-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
          .patient-info { border: 1px solid #333; padding: 5px; margin-bottom: 15px; display: flex; justify-content: space-between; font-size: 12px; }
          .content { display: flex; gap: 15px; font-size: 12px; min-height: 700px; }
          .left-column { width: 25%; border-right: 1px dotted #999; padding-right: 5px; }
          .right-column { width: 75%; }
          .footer { border-top: 1px solid #333; padding-top: 5px; margin-top: auto; font-size: 10px; text-align: center; }
        `,
        htmlContent: `
          <div class="header">
            <div>
              <div class="doctor-name">{{doctor.name}}</div>
              <div>{{doctor.degrees}}</div>
            </div>
            <div style="text-align: right;">
              <div>{{hospital.name}}</div>
              <div>{{hospital.phone}}</div>
            </div>
          </div>
          <div class="patient-info">
            <div>Name: {{patient.name}}</div>
            <div>Age: {{patient.age}}</div>
            <div>Date: {{date}}</div>
            <div>ID: {{patient.id}}</div>
          </div>
          <div class="content">
            <div class="left-column">
              <strong>C/C & O/E</strong><br/>
              {{content.left}}
            </div>
            <div class="right-column">
              <strong>Rx</strong><br/>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            {{hospital.address}} | {{showTime}} | Next Visit: {{nextVisit}}
          </div>
        `
      },
      {
        name: 'Bold Left Emphasis',
        description: 'Highlights the diagnosis and advice section with a distinct sidebar style.',
        category: 'creative',
        isSystem: true,
        cssContent: `
          .container { display: flex; height: 100%; }
          .sidebar { width: 30%; background-color: var(--background-color, #f0fdf4); padding: 20px; border-right: 4px solid var(--primary-color, #16a34a); display: flex; flex-direction: column; }
          .main { width: 70%; padding: 20px; display: flex; flex-direction: column; }
          .doctor-name { font-size: 22px; font-weight: bold; color: var(--primary-color, #16a34a); margin-bottom: 10px; }
          .header { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .patient-box { background: #fff; padding: 10px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #ddd; font-size: 12px; }
          .footer { margin-top: auto; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
        `,
        htmlContent: `
          <div class="container">
            <div class="sidebar">
              <div style="margin-bottom: 30px;">
                <div style="font-weight: bold; font-size: 18px;">{{hospital.name}}</div>
                <div style="font-size: 12px;">{{hospital.phone}}</div>
              </div>
              <div class="patient-box">
                <div>{{patient.name}}</div>
                <div>{{patient.age}} / {{patient.gender}}</div>
                <div>{{date}}</div>
              </div>
              <div style="flex-grow: 1;">
                <strong>Findings & Advice</strong><br/>
                {{content.left}}
              </div>
              <div style="font-size: 10px; margin-top: 20px;">
                Next Visit: {{nextVisit}}
              </div>
            </div>
            <div class="main">
              <div class="header">
                <div class="doctor-name">{{doctor.name}}</div>
                <div>{{doctor.degrees}}</div>
              </div>
              <div style="flex-grow: 1;">
                <div style="font-size: 36px; color: #ddd; margin-bottom: 10px;">Rx</div>
                {{content.right}}
              </div>
              <div class="footer">
                {{hospital.address}} | Signature: ________________
              </div>
            </div>
          </div>
        `
      },
      {
        name: 'Dual Language Focus',
        description: 'Designed to accommodate both English and Bangla text comfortably.',
        category: 'bilingual',
        isSystem: true,
        cssContent: `
          .header { display: flex; justify-content: space-between; border-bottom: 2px double #000; padding-bottom: 10px; margin-bottom: 20px; }
          .doctor-en { text-align: left; width: 45%; }
          .doctor-bn { text-align: right; width: 45%; font-family: 'Kalpurush', sans-serif; }
          .doctor-name { font-size: 20px; font-weight: bold; }
          .patient-info { display: flex; gap: 20px; background: #f9f9f9; padding: 10px; margin-bottom: 20px; border: 1px solid #eee; font-size: 14px; }
          .content { display: flex; gap: 20px; min-height: 600px; }
          .left-column { width: 35%; border-right: 1px dashed #ccc; padding-right: 15px; }
          .right-column { width: 65%; }
          .footer { margin-top: auto; border-top: 1px solid #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 12px; }
        `,
        htmlContent: `
          <div class="header">
            <div class="doctor-en">
              <div class="doctor-name">{{doctor.name}}</div>
              <div>{{doctor.degrees}}</div>
            </div>
            <div class="doctor-bn">
              <div class="doctor-name">{{doctor.nameBangla}}</div>
              <div>{{doctor.degreesBangla}}</div>
            </div>
          </div>
          <div class="patient-info">
            <div>Name: {{patient.name}}</div>
            <div>Age: {{patient.age}}</div>
            <div>Date: {{date}}</div>
          </div>
          <div class="content">
            <div class="left-column">
              <strong>Tests / পরীক্ষা</strong><br/>
              {{content.left}}
            </div>
            <div class="right-column">
              <div style="font-size: 24px; font-weight: bold;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            <div>{{hospital.address}}</div>
            <div>Next Visit / পরবর্তী সাক্ষাৎ: {{nextVisit}}</div>
          </div>
        `
      },
      {
        name: 'Minimalist Blocks',
        description: 'Uses block sections to organize information clearly without clutter.',
        category: 'minimal',
        isSystem: true,
        cssContent: `
          .header { margin-bottom: 30px; }
          .doctor-block { background: var(--primary-color, #333); color: white; padding: 15px; border-radius: 4px; margin-bottom: 10px; }
          .doctor-name { font-size: 20px; font-weight: bold; }
          .patient-block { border: 1px solid #ddd; padding: 10px; border-radius: 4px; display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
          .content { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; min-height: 500px; }
          .left-panel { background: #fcfcfc; padding: 15px; border-radius: 4px; border: 1px solid #f0f0f0; }
          .footer { margin-top: auto; text-align: center; font-size: 11px; color: #888; padding-top: 20px; }
        `,
        htmlContent: `
          <div class="header">
            <div class="doctor-block">
              <div class="doctor-name">{{doctor.name}}</div>
              <div>{{doctor.degrees}}</div>
            </div>
            <div style="text-align: right; font-size: 12px;">{{hospital.name}} | {{hospital.phone}}</div>
          </div>
          <div class="patient-block">
            <div><strong>Patient:</strong> {{patient.name}}</div>
            <div><strong>Age:</strong> {{patient.age}}</div>
            <div><strong>Date:</strong> {{date}}</div>
          </div>
          <div class="content">
            <div class="left-panel">
              <strong>Observations</strong><br/>
              {{content.left}}
            </div>
            <div class="right-panel">
              <div style="font-size: 24px; margin-bottom: 15px;">Rx</div>
              {{content.right}}
            </div>
          </div>
          <div class="footer">
            {{hospital.address}}<br/>
            Next Visit: {{nextVisit}}
          </div>
        `
      }
    ];

    for (const baseTemplate of baseTemplates) {
      // Check if template exists by name to avoid duplicates
      const exists = await this.printTemplateModel.findOne({ name: baseTemplate.name, isSystem: true });
      if (!exists) {
        await this.printTemplateModel.create(baseTemplate);
      }
    }
  }
}
