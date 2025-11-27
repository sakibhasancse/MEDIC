'use client';

import React, { useEffect, useState } from 'react';
import { printTemplateAPI } from '@/lib/api';

interface PrescriptionPreviewProps {
  prescription: any;
  hospital: any;
}

export default function PrescriptionPreview({ prescription, hospital }: PrescriptionPreviewProps) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      if (hospital?.defaultPrintTemplateId) {
        try {
          const response = await printTemplateAPI.getById(hospital.defaultPrintTemplateId);
          setTemplate(response.data);
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }
      setLoading(false);
    };

    loadTemplate();
  }, [hospital?.defaultPrintTemplateId]);

  if (loading) return <div>Loading preview...</div>;

  // Helper to generate HTML for a list of items
  const generateListHTML = (items: string[], title: string) => {
    if (!items || items.length === 0) return '';
    return `
      <div class="section">
        <h3 class="section-title">${title}</h3>
        <ul class="item-list">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  // Helper to generate HTML for medicines
  const generateMedicinesHTML = (medicines: any[]) => {
    if (!medicines || medicines.length === 0) return '';
    return `
      <div class="medicines-section">
        <h3 class="section-title">Rx (Medicines)</h3>
        ${medicines.map((med, index) => `
          <div class="medicine-item">
            <div class="medicine-name">${index + 1}. ${med.name} ${med.type || ''}</div>
            ${med.genericName ? `<div class="medicine-generic">(${med.genericName})</div>` : ''}
            <div class="medicine-details">
              ${med.dose} - ${med.duration} - ${med.instructions}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // Helper to generate HTML for vital signs
  const generateVitalsHTML = (vitals: any) => {
    if (!vitals || !Object.values(vitals).some(v => v)) return '';
    const items = [];
    if (vitals.bloodPressure) items.push(`BP: ${vitals.bloodPressure}`);
    if (vitals.pulse) items.push(`Pulse: ${vitals.pulse}`);
    if (vitals.temperature) items.push(`Temp: ${vitals.temperature}`);
    if (vitals.weight) items.push(`Weight: ${vitals.weight}`);
    return `
      <div class="section vitals">
        <h3 class="section-title">Vital Signs</h3>
        <div class="vitals-content">${items.join(' | ')}</div>
      </div>
    `;
  };

  // Generate content for columns based on printLayout
  const generateColumnContent = (sections: string[]) => {
    return sections.map(section => {
      switch (section) {
        case 'tests': return generateListHTML(prescription.tests, 'Investigations');
        case 'advice': return generateListHTML(prescription.advice, 'Advice');
        case 'medicines': return generateMedicinesHTML(prescription.medicines);
        case 'chiefComplaint': return prescription.chiefComplaint ? `<div class="section"><h3>Chief Complaint</h3><p>${prescription.chiefComplaint}</p></div>` : '';
        case 'diagnosis': return prescription.diagnosis ? `<div class="section"><h3>Diagnosis</h3><p>${prescription.diagnosis}</p></div>` : '';
        case 'vitalSigns': return generateVitalsHTML(prescription.vitalSigns);
        default: return '';
      }
    }).join('');
  };

  const renderTemplate = () => {
    if (!template) return <div>No template selected</div>;

    const { doctorInfo, headerStructured, footerSettings } = hospital;
    const { patient } = prescription;

    // Default layout if not specified
    const layout = hospital.printLayout || {
      leftColumn: ['tests', 'advice', 'vitalSigns'],
      rightColumn: ['medicines', 'diagnosis']
    };

    const leftContent = generateColumnContent(layout.leftColumn);
    const rightContent = generateColumnContent(layout.rightColumn);

    let html = template.htmlContent;

    // Replace Placeholders
    // Doctor
    html = html.replace(/{{doctor.name}}/g, doctorInfo?.name || '');
    html = html.replace(/{{doctor.degrees}}/g, doctorInfo?.degrees?.join(', ') || '');
    html = html.replace(/{{doctor.bmdc}}/g, doctorInfo?.bmdcNumber ? `Reg: ${doctorInfo.bmdcNumber}` : '');
    
    // Hospital
    html = html.replace(/{{hospital.name}}/g, headerStructured?.clinicName || '');
    html = html.replace(/{{hospital.address}}/g, headerStructured?.address || '');
    html = html.replace(/{{hospital.phone}}/g, headerStructured?.phone || '');
    html = html.replace(/{{hospital.email}}/g, headerStructured?.email || '');
    // Logo handling - if no logo, remove the img tag or placeholder
    if (headerStructured?.logo) {
       // Assuming template has <img src="{{hospital.logo}}" />
       html = html.replace(/{{hospital.logo}}/g, headerStructured.logo);
    } else {
       html = html.replace(/<img[^>]*src="{{hospital.logo}}"[^>]*>/g, '');
    }

    // Patient
    html = html.replace(/{{patient.name}}/g, patient?.name || '');
    html = html.replace(/{{patient.age}}/g, patient?.age ? `${patient.age}Y` : '');
    html = html.replace(/{{patient.gender}}/g, patient?.gender || '');
    html = html.replace(/{{date}}/g, new Date().toLocaleDateString());

    // Content
    html = html.replace(/{{content.left}}/g, leftContent);
    html = html.replace(/{{content.right}}/g, rightContent);

    // Footer
    html = html.replace(/{{nextVisit}}/g, prescription.nextVisitDuration ? `Next visit after ${prescription.nextVisitDuration} days` : '');
    html = html.replace(/{{showTime}}/g, footerSettings?.showTime || '');

    return (
      <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '0' }}>
        <style>{template.cssContent}</style>
        {/* Add some base styles for generated content */}
        <style>{`
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; margin-bottom: 5px; text-decoration: underline; }
          .item-list { padding-left: 20px; margin: 0; }
          .medicine-item { margin-bottom: 10px; }
          .medicine-name { font-weight: bold; }
          .medicine-generic { font-style: italic; font-size: 0.9em; color: #666; }
          .medicine-details { margin-left: 10px; }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  };

  return renderTemplate();
}
