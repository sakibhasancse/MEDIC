import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from '../schemas/prescription.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Patient, PatientDocument } from '../schemas/patient.schema';
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
  ) { }

  async create(doctorId: string, prescriptionData: any) {
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

    // Generate PDF
    await this.generatePDF(prescription._id.toString());

    return prescription;
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
    const prescription = await this.prescriptionModel
      .findById(prescriptionId)
      .populate('doctorId')
      .populate('patientId')
      .exec();

    if (!prescription) throw new Error('Prescription not found');

    const doctor = prescription.doctorId as any;
    const patient = prescription.patientId as any;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfPath = path.join(uploadsDir, `${prescription.prescriptionNumber}.pdf`);

    // Generate HTML content
    const html = this.generateHTMLTemplate(prescription, doctor, patient);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
    await browser.close();

    // Update prescription with PDF URL
    prescription.pdfUrl = `/uploads/${prescription.prescriptionNumber}.pdf`;
    await prescription.save();

    return pdfPath;
  }

  private generateHTMLTemplate(prescription: any, doctor: any, patient: any): string {
    const isBangla = prescription.language === 'bn';

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
            padding: 20px;
            color: #1a1a1a;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .header h1 {
            color: #2563eb;
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .header p {
            color: #666;
            font-size: 12px;
            margin: 2px 0;
          }
          
          .rx-number {
            text-align: right;
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
          
          .patient-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .patient-info h3 {
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .info-item {
            font-size: 13px;
          }
          
          .info-item strong {
            color: #1a1a1a;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            color: #2563eb;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .medicines-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .medicines-table th {
            background: #2563eb;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 13px;
          }
          
          .medicines-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          
          .medicines-table tr:hover {
            background: #f8fafc;
          }
          
          .advice-list, .tests-list {
            list-style: none;
            padding-left: 0;
          }
          
          .advice-list li, .tests-list li {
            padding: 8px 0;
            padding-left: 20px;
            position: relative;
            font-size: 13px;
          }
          
          .advice-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #2563eb;
            font-weight: bold;
          }
          
          .tests-list li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #2563eb;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .signature {
            text-align: right;
          }
          
          .signature img {
            max-width: 150px;
            margin-bottom: 5px;
          }
          
          .qr-code {
            text-align: center;
          }
          
          .qr-code img {
            width: 100px;
            height: 100px;
          }
          
          .qr-code p {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${doctor.prescriptionHeader?.clinicName ? `<h1>${doctor.prescriptionHeader.clinicName}</h1>` : ''}
          ${doctor.prescriptionHeader?.address ? `<p>${doctor.prescriptionHeader.address}</p>` : ''}
          ${doctor.prescriptionHeader?.phone ? `<p>Phone: ${doctor.prescriptionHeader.phone}</p>` : ''}
          ${doctor.prescriptionHeader?.email ? `<p>Email: ${doctor.prescriptionHeader.email}</p>` : ''}
          <h2 style="margin-top: 10px;">${doctor.name}</h2>
          ${doctor.specialization ? `<p>${doctor.specialization}</p>` : ''}
        </div>
        
        <div class="rx-number">
          <strong>Rx No:</strong> ${prescription.prescriptionNumber} | 
          <strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}
        </div>
        
        <div class="patient-info">
          <h3>${isBangla ? 'রোগীর তথ্য' : 'Patient Information'}</h3>
          <div class="info-grid">
            <div class="info-item"><strong>${isBangla ? 'নাম' : 'Name'}:</strong> ${patient.name}</div>
            <div class="info-item"><strong>${isBangla ? 'বয়স' : 'Age'}:</strong> ${patient.age || 'N/A'}</div>
            <div class="info-item"><strong>${isBangla ? 'ফোন' : 'Phone'}:</strong> ${patient.phone}</div>
            <div class="info-item"><strong>${isBangla ? 'লিঙ্গ' : 'Gender'}:</strong> ${patient.gender || 'N/A'}</div>
          </div>
        </div>
        
        ${prescription.diagnosis ? `
          <div class="section">
            <div class="section-title">${isBangla ? 'রোগ নির্ণয়' : 'Diagnosis'}</div>
            <p>${prescription.diagnosis}</p>
          </div>
        ` : ''}
        
        ${prescription.medicines && prescription.medicines.length > 0 ? `
          <div class="section">
            <div class="section-title">Rx</div>
            <table class="medicines-table">
              <thead>
                <tr>
                  <th>${isBangla ? 'ওষুধের নাম' : 'Medicine'}</th>
                  <th>${isBangla ? 'মাত্রা' : 'Dose'}</th>
                  <th>${isBangla ? 'সময়কাল' : 'Duration'}</th>
                  <th>${isBangla ? 'নির্দেশনা' : 'Instructions'}</th>
                </tr>
              </thead>
              <tbody>
                ${prescription.medicines.map((med: any) => `
                  <tr>
                    <td><strong>${med.name}</strong>${med.genericName ? `<br><small>${med.genericName}</small>` : ''}</td>
                    <td>${med.dose}</td>
                    <td>${med.duration || '-'}</td>
                    <td>${med.instructions || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${prescription.advice && prescription.advice.length > 0 ? `
          <div class="section">
            <div class="section-title">${isBangla ? 'পরামর্শ' : 'Advice'}</div>
            <ul class="advice-list">
              ${prescription.advice.map((adv: string) => `<li>${adv}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${prescription.tests && prescription.tests.length > 0 ? `
          <div class="section">
            <div class="section-title">${isBangla ? 'পরীক্ষা' : 'Tests'}</div>
            <ul class="tests-list">
              ${prescription.tests.map((test: string) => `<li>${test}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${prescription.nextVisit ? `
          <div class="section">
            <div class="section-title">${isBangla ? 'পরবর্তী ভিজিট' : 'Next Visit'}</div>
            <p>${new Date(prescription.nextVisit).toLocaleDateString()}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <div class="qr-code">
            <img src="${prescription.qrCode}" alt="QR Code" />
            <p>${isBangla ? 'যাচাই করতে স্ক্যান করুন' : 'Scan to verify'}</p>
          </div>
          
          <div class="signature">
            ${doctor.signature ? `<img src="${doctor.signature}" alt="Signature" />` : ''}
            <p><strong>${doctor.name}</strong></p>
            ${doctor.specialization ? `<p>${doctor.specialization}</p>` : ''}
          </div>
        </div>
        
        ${doctor.prescriptionFooter?.text ? `
          <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #666;">
            ${doctor.prescriptionFooter.text}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }
}
