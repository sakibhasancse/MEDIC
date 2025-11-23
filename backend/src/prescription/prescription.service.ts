import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Patient, PatientDocument } from '../schemas/patient.schema';
import { PrintTemplateService } from '../print-template/print-template.service';
import * as QRCode from 'qrcode';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private printTemplateService: PrintTemplateService,
  ) { }

  async create(doctorId: string, prescriptionData: any) {
    try {
      console.log('Creating prescription for doctor:', doctorId);
      // Generate unique prescription number
      const count = await this.prescriptionModel.countDocuments();
      const prescriptionNumber = `RX${Date.now()}${count + 1}`;

      // Generate QR code
      const qrCodeUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify/${prescriptionNumber}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl);

      const prescription = new this.prescriptionModel({
        ...prescriptionData,
        doctorId,
        prescriptionNumber,
        qrCode,
      });

      await prescription.save();
      console.log('Prescription saved:', prescription._id);

      // Generate PDF
      console.log('Generating PDF...');
      await this.generatePDF(prescription._id.toString());
      console.log('PDF generated successfully');

      return prescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  async findById(id: string) {
    return this.prescriptionModel
      .findById(id)
      .populate('doctorId')
      .populate('patientId')
      .exec();
  }

  async findByPrescriptionNumber(prescriptionNumber: string) {
    return this.prescriptionModel
      .findOne({ prescriptionNumber })
      .populate('doctorId')
      .populate('patientId')
      .exec();
  }

  async findAll(doctorId: string) {
    return this.prescriptionModel
      .find({ doctorId })
      .sort({ createdAt: -1 })
      .populate('patientId')
      .exec();
  }

  async getPatientHistory(patientId: string, filters?: any) {
    const query: any = { patientId };

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    if (filters?.diagnosis) {
      query.diagnosis = { $regex: filters.diagnosis, $options: 'i' };
    }

    return this.prescriptionModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('doctorId')
      .exec();
  }

  async generatePDF(prescriptionId: string) {
    try {
      const prescription = await this.prescriptionModel
        .findById(prescriptionId)
        .populate('doctorId')
        .populate('patientId')
        .populate('hospitalId')
        .exec();

      if (!prescription) throw new Error('Prescription not found');

      const doctor = prescription.doctorId as any;
      const patient = prescription.patientId as any;
      const hospital = prescription.hospitalId as any;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const pdfPath = path.join(uploadsDir, `${prescription.prescriptionNumber}.pdf`);

      // Fetch Template
      let templateHtml = '';
      let templateCss = '';
      if (hospital?.defaultPrintTemplateId) {
        const template = await this.printTemplateService.findOne(hospital.defaultPrintTemplateId);
        if (template) {
          templateHtml = template.htmlContent;
          templateCss = template.cssContent;
        }
      }

      // Generate HTML content
      console.log('Generating HTML template...');
      const html = this.generateHTMLTemplate(prescription, doctor, patient, hospital, templateHtml, templateCss);

      // Generate PDF using Puppeteer
      console.log('Launching Puppeteer...');
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Use hospital print settings if available, otherwise default
      const printSettings = hospital?.printSettings || {};

      console.log('Saving PDF...');
      await page.pdf({
        path: pdfPath,
        format: (printSettings.paperSize as any) || 'A4',
        printBackground: true,
        margin: {
          top: printSettings.marginTop || '0px',
          right: printSettings.marginRight || '0px',
          bottom: printSettings.marginBottom || '0px',
          left: printSettings.marginLeft || '0px',
        },
        landscape: printSettings.orientation === 'landscape',
      });
      await browser.close();

      // Update prescription with PDF URL
      prescription.pdfUrl = `/uploads/${prescription.prescriptionNumber}.pdf`;
      await prescription.save();

      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private generateHTMLTemplate(prescription: any, doctor: any, patient: any, hospital: any, templateHtml?: string, templateCss?: string): string {
    const isBangla = prescription.language === 'bn';
    const doctorInfo = hospital?.doctorInfo || {};
    const headerStructured = hospital?.headerStructured || {};
    const footerSettings = hospital?.footerSettings || {};
    const printLayout = hospital?.printLayout || {
      leftColumn: ['chiefComplaint', 'historyOfPresentIllness', 'physicalExamination', 'vitalSigns', 'tests', 'advice'],
      rightColumn: ['diagnosis', 'medicines'],
    };

    // Helper to render sections
    const renderSection = (sectionName: string) => {
      switch (sectionName) {
        case 'chiefComplaint':
          return prescription.chiefComplaint ? `
            <div class="section">
              <div class="section-title">Chief Complaint (C/C)</div>
              <p>${prescription.chiefComplaint}</p>
            </div>
          ` : '';
        case 'historyOfPresentIllness':
          return prescription.historyOfPresentIllness ? `
            <div class="section">
              <div class="section-title">History of Present Illness</div>
              <p>${prescription.historyOfPresentIllness}</p>
            </div>
          ` : '';
        case 'physicalExamination':
          return prescription.physicalExamination ? `
            <div class="section">
              <div class="section-title">Physical Examination</div>
              <p>${prescription.physicalExamination}</p>
            </div>
          ` : '';
        case 'vitalSigns':
          return prescription.vitalSigns && Object.values(prescription.vitalSigns).some(v => v) ? `
            <div class="section">
              <div class="section-title">Vital Signs</div>
              <div class="vital-signs-grid">
                ${prescription.vitalSigns.bloodPressure ? `<div><strong>BP:</strong> ${prescription.vitalSigns.bloodPressure}</div>` : ''}
                ${prescription.vitalSigns.pulse ? `<div><strong>Pulse:</strong> ${prescription.vitalSigns.pulse}</div>` : ''}
                ${prescription.vitalSigns.temperature ? `<div><strong>Temp:</strong> ${prescription.vitalSigns.temperature}</div>` : ''}
                ${prescription.vitalSigns.weight ? `<div><strong>Weight:</strong> ${prescription.vitalSigns.weight}</div>` : ''}
                ${prescription.vitalSigns.height ? `<div><strong>Height:</strong> ${prescription.vitalSigns.height}</div>` : ''}
              </div>
            </div>
          ` : '';
        case 'tests':
          return prescription.tests && prescription.tests.length > 0 ? `
            <div class="section">
              <div class="section-title">${isBangla ? 'পরীক্ষা' : 'Investigations'}</div>
              <ul class="tests-list">
                ${prescription.tests.map((test: string) => `<li>${test}</li>`).join('')}
              </ul>
            </div>
          ` : '';
        case 'advice':
          return prescription.advice && prescription.advice.length > 0 ? `
            <div class="section">
              <div class="section-title">${isBangla ? 'পরামর্শ' : 'Advice'}</div>
              <ul class="advice-list">
                ${prescription.advice.map((adv: string) => `<li>${adv}</li>`).join('')}
              </ul>
            </div>
          ` : '';
        case 'diagnosis':
          return prescription.diagnosis ? `
            <div class="section">
              <div class="section-title">${isBangla ? 'রোগ নির্ণয়' : 'Diagnosis (O/E)'}</div>
              <p>${prescription.diagnosis}</p>
            </div>
          ` : '';
        case 'medicines':
          return prescription.medicines && prescription.medicines.length > 0 ? `
            <div class="section">
              <div class="section-title" style="font-size: 24px; border: none; margin-bottom: 5px;">℞</div>
              <div class="medicines-list">
                ${prescription.medicines.map((med: any, index: number) => `
                  <div class="medicine-item">
                    <div class="medicine-name">
                      ${index + 1}. ${med.name}
                      ${med.genericName ? `<span class="medicine-generic">(${med.genericName})</span>` : ''}
                    </div>
                    <div class="medicine-details">
                      ${med.dose} &nbsp;|&nbsp; ${med.duration || ''} &nbsp;|&nbsp; ${med.instructions || ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';
        default:
          return '';
      }
    };

    // If template is provided, use it
    if (templateHtml) {
      let html = templateHtml;

      // Generate Column Content
      const leftContent = printLayout.leftColumn.map(s => renderSection(s)).join('');
      const rightContent = printLayout.rightColumn.map(s => renderSection(s)).join('');

      // Replace Placeholders
      // Doctor
      html = html.replace(/{{doctor.name}}/g, doctorInfo?.name || doctor.name || '');
      html = html.replace(/{{doctor.degrees}}/g, doctorInfo?.degrees?.join(', ') || '');
      html = html.replace(/{{doctor.bmdc}}/g, doctorInfo?.bmdcNumber ? `Reg: ${doctorInfo.bmdcNumber}` : '');

      // Doctor Rich Text
      html = html.replace(/{{doctor.info_rich_text}}/g, hospital?.doctorInfoRichText || '');
      html = html.replace(/{{doctor.info_rich_text_bangla}}/g, hospital?.doctorInfoRichTextBangla || '');

      // Hospital
      html = html.replace(/{{hospital.name}}/g, headerStructured?.clinicName || '');
      html = html.replace(/{{hospital.address}}/g, headerStructured?.address || '');
      html = html.replace(/{{hospital.phone}}/g, headerStructured?.phone || '');
      html = html.replace(/{{hospital.email}}/g, headerStructured?.email || '');

      // Hospital Rich Text
      html = html.replace(/{{hospital.info_rich_text}}/g, hospital?.hospitalInfoRichText || '');
      html = html.replace(/{{hospital.info_rich_text_bangla}}/g, hospital?.hospitalInfoRichTextBangla || '');

      if (headerStructured?.logo) {
        html = html.replace(/{{hospital.logo}}/g, headerStructured.logo);
      } else {
        html = html.replace(/<img[^>]*src="{{hospital.logo}}"[^>]*>/g, '');
      }

      // Patient
      html = html.replace(/{{patient.name}}/g, patient?.name || '');
      html = html.replace(/{{patient.age}}/g, patient?.age ? `${patient.age}Y` : '');
      html = html.replace(/{{patient.gender}}/g, patient?.gender || '');
      html = html.replace(/{{date}}/g, new Date(prescription.createdAt).toLocaleDateString());

      // Content
      html = html.replace(/{{content.left}}/g, leftContent);
      html = html.replace(/{{content.right}}/g, rightContent);

      // Footer
      html = html.replace(/{{nextVisit}}/g, prescription.nextVisitDuration ? `Next visit after ${prescription.nextVisitDuration} days` : '');
      html = html.replace(/{{showTime}}/g, footerSettings?.showTime || '');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600&family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
            ${templateCss || ''}
            /* Base styles for generated content */
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; margin-bottom: 5px; text-decoration: underline; }
            .tests-list, .advice-list { padding-left: 20px; margin: 0; }
            .medicine-item { margin-bottom: 10px; }
            .medicine-name { font-weight: bold; }
            .medicine-generic { font-style: italic; font-size: 0.9em; color: #666; }
            .medicine-details { margin-left: 10px; }
            .vital-signs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600&family=Inter:wght@400;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: ${isBangla ? "'Noto Sans Bengali', sans-serif" : "'Inter', sans-serif"};
            padding: 0;
            color: #1a1a1a;
            font-size: ${hospital?.printSettings?.fontSize || '12px'};
            line-height: 1.5;
          }
          
          .header {
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .doctor-info-left {
            flex: 1;
          }

          .doctor-info-right {
            flex: 1;
            text-align: right;
          }
          
          .doctor-info h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 5px;
            font-weight: 700;
          }
          
          .doctor-info p {
            color: #4a4a4a;
            font-size: 12px;
            margin: 2px 0;
          }

          .header-logo {
            max-height: 80px;
            max-width: 150px;
            object-fit: contain;
          }
          
          .patient-info {
            background: #f3f4f6;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            font-size: 12px;
          }
          
          .main-content {
            display: grid;
            grid-template-columns: 1fr 1.5fr; /* Left column narrower than right */
            gap: 30px;
            min-height: 500px;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            color: #1a1a1a;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .vital-signs-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            font-size: 11px;
          }
          
          .tests-list, .advice-list {
            list-style: none;
            padding-left: 0;
          }
          
          .tests-list li, .advice-list li {
            padding: 4px 0;
            padding-left: 15px;
            position: relative;
          }
          
          .tests-list li:before { content: "•"; position: absolute; left: 0; font-weight: bold; }
          .advice-list li:before { content: "›"; position: absolute; left: 0; font-weight: bold; }
          
          .medicine-item {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .medicine-name {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .medicine-generic {
            font-weight: 400;
            font-size: 11px;
            color: #666;
            font-style: italic;
            margin-left: 5px;
          }
          
          .medicine-details {
            font-size: 12px;
            color: #4a4a4a;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #1a1a1a;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            font-size: 11px;
            align-items: end;
          }
          
          .footer-left {
            text-align: left;
          }
          
          .footer-center {
            text-align: center;
          }
          
          .footer-right {
            text-align: right;
          }

          .signature-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 40px;
            margin-bottom: 10px;
          }

          .signature-box {
            text-align: center;
            min-width: 200px;
          }

          .signature-img {
            height: 60px;
            object-fit: contain;
            margin-bottom: 5px;
          }

          .signature-line {
            border-top: 1px solid #1a1a1a;
            padding-top: 5px;
            font-weight: 600;
          }
          
          .footer-logo {
            height: 40px;
            object-fit: contain;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <!-- Left: Bangla Info -->
          <div class="doctor-info-left doctor-info">
            ${doctorInfo.nameInBangla ? `<h1>${doctorInfo.nameInBangla}</h1>` : ''}
          </div>
          
          <!-- Right: English Info -->
          <div class="doctor-info-right doctor-info">
            ${doctorInfo.name ? `<h1>${doctorInfo.name}</h1>` : `<h1>${doctor?.name || ''}</h1>`}
            ${doctorInfo.degrees && doctorInfo.degrees.length > 0 ? `<p>${doctorInfo.degrees.join(', ')}</p>` : ''}
            ${doctorInfo.bmdcNumber ? `<p>BMDC Reg: ${doctorInfo.bmdcNumber}</p>` : ''}
            ${doctorInfo.emails && doctorInfo.emails.length > 0 ? `<p>${doctorInfo.emails.join(' | ')}</p>` : ''}
          </div>
        </div>
        
        <!-- Patient Info -->
        <div class="patient-info">
          <div><strong>${isBangla ? 'নাম' : 'Name'}:</strong> ${patient.name}</div>
          <div><strong>${isBangla ? 'বয়স' : 'Age'}:</strong> ${patient.age || 'N/A'}</div>
          <div><strong>${isBangla ? 'লিঙ্গ' : 'Gender'}:</strong> ${patient.gender || 'N/A'}</div>
          <div><strong>${isBangla ? 'তারিখ' : 'Date'}:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</div>
          ${patient.phone ? `<div><strong>Phone:</strong> ${patient.phone}</div>` : ''}
        </div>
        
        <!-- Main Content (2 Columns) -->
        <div class="main-content">
          <!-- Left Column -->
          <div class="left-column">
            ${printLayout.leftColumn.map((section: string) => renderSection(section)).join('')}
          </div>
          
          <!-- Right Column -->
          <div class="right-column">
            ${printLayout.rightColumn.map((section: string) => renderSection(section)).join('')}
          </div>
        </div>
        
        <!-- Signature -->
        ${hospital?.signature ? `
          <div class="signature-section">
            <div class="signature-box">
              <img src="${hospital.signature}" class="signature-img" alt="Signature" />
              <div class="signature-line">${doctorInfo.name || doctor?.name || ''}</div>
            </div>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-left">
            ${headerStructured.logo ? `<img src="${headerStructured.logo}" class="footer-logo" alt="Logo" />` : ''}
            ${headerStructured.clinicName ? `<strong>${headerStructured.clinicName}</strong><br>` : ''}
            ${headerStructured.address ? `${headerStructured.address}<br>` : ''}
            ${headerStructured.phone ? `Phone: ${headerStructured.phone}` : ''}
          </div>
          
          <div class="footer-center">
            ${prescription.nextVisitDuration ? `
              <div style="font-weight: bold; font-size: 14px; color: #2563eb;">
                Next visit after ${prescription.nextVisitDuration} days
              </div>
            ` : ''}
          </div>
          
          <div class="footer-right">
            ${footerSettings.showTime ? `
              <div style="font-weight: bold; font-size: 14px; color: #16a34a;">
                Show Time: ${footerSettings.showTime}
              </div>
            ` : ''}
            <div style="margin-top: 5px;">
              <img src="${prescription.qrCode}" alt="QR" style="width: 40px; height: 40px;" />
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
