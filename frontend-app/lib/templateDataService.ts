// Template Data Service - handles data population and dummy data generation

export interface DummyData {
  patient: {
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  medicines: Array<{
    name: string;
    dose: string;
    duration: string;
    instructions: string;
  }>;
  advice: string[];
  diagnosis: string[];
  tests: string[];
}

export const templateDataService = {
  // Populate template with real hospital/doctor data
  populateData(content: string, hospitalData: any): string {
    if (!content) return '';

    let populated = content;

    // Doctor data
    if (hospitalData?.doctorInfo) {
      populated = populated
        .replace(/\{\{doctor\.name\}\}/g, hospitalData.doctorInfo.name || '')
        .replace(/\{\{doctor\.degrees\}\}/g, hospitalData.doctorInfo.degrees?.join(', ') || '')
        .replace(/\{\{doctor\.bmdc\}\}/g, hospitalData.doctorInfo.bmdcNumber || '')
        .replace(/\{\{doctor\.email\}\}/g, hospitalData.doctorInfo.emails?.[0] || '');
    }

    // Hospital data
    if (hospitalData?.headerStructured) {
      populated = populated
        .replace(/\{\{hospital\.name\}\}/g, hospitalData.headerStructured.clinicName || hospitalData.name || '')
        .replace(/\{\{hospital\.address\}\}/g, hospitalData.headerStructured.address || '')
        .replace(/\{\{hospital\.phone\}\}/g, hospitalData.headerStructured.phone || '')
        .replace(/\{\{hospital\.email\}\}/g, hospitalData.headerStructured.email || '');
    }

    // Footer data
    if (hospitalData?.footerSettings) {
      populated = populated
        .replace(/\{\{showTime\}\}/g, hospitalData.footerSettings.showTime || '')
        .replace(/\{\{nextVisit\}\}/g, hospitalData.footerSettings.defaultNextVisitDay || '');
    }

    populated = populated.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());

    return populated;
  },

  // Generate dummy data for preview
  getDummyData(): DummyData {
    return {
      patient: {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '01712345678'
      },
      medicines: [
        {
          name: 'Tab. Paracetamol 500mg',
          dose: '1+0+1',
          duration: '5 days',
          instructions: 'After meal'
        },
        {
          name: 'Cap. Omeprazole 20mg',
          dose: '0+0+1',
          duration: '7 days',
          instructions: 'Before meal'
        },
        {
          name: 'Syp. Antacid 200ml',
          dose: '2 tsp',
          duration: '3 days',
          instructions: 'When needed'
        }
      ],
      advice: [
        'Take adequate rest',
        'Drink plenty of water (8-10 glasses daily)',
        'Avoid oily and spicy food',
        'Complete the full course of medicine',
        'Return if symptoms persist or worsen'
      ],
      diagnosis: ['Fever', 'Headache', 'Body ache'],
      tests: ['CBC (Complete Blood Count)', 'X-Ray Chest PA View']
    };
  },

  // Format medicine list for display
  formatMedicines(medicines: DummyData['medicines']): string {
    return medicines.map((med, index) =>
      `${index + 1}. ${med.name}\n   ${med.dose} - ${med.duration}\n   ${med.instructions}`
    ).join('\n\n');
  },

  // Format advice list for display
  formatAdvice(advice: string[]): string {
    return advice.map((item, index) => `${index + 1}. ${item}`).join('\n');
  },

  // Format diagnosis list for display
  formatDiagnosis(diagnosis: string[]): string {
    return diagnosis.join(', ');
  },

  // Format tests list for display
  formatTests(tests: string[]): string {
    return tests.map((test, index) => `${index + 1}. ${test}`).join('\n');
  },

  // Get available templates
  getTemplates(): Template[] {
    return [
      {
        id: 'minimalist',
        name: 'Minimalist Clean',
        description: 'A simple, clean layout with focus on readability. Perfect for general practice.',
        thumbnail: 'bg-gray-50',
        canvasBg: '#ffffff',
        printLayout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        elements: [
          {
            id: 'header-title',
            type: 'text',
            content: '{{hospital.name}}',
            position: { x: 40, y: 40 },
            size: { width: 500, height: 40 },
            style: { fontSize: 24, fontFamily: 'Inter', color: '#111827', align: 'left', bold: true, italic: false }
          },
          {
            id: 'header-subtitle',
            type: 'text',
            content: '{{hospital.address}}',
            position: { x: 40, y: 80 },
            size: { width: 500, height: 20 },
            style: { fontSize: 14, fontFamily: 'Inter', color: '#4B5563', align: 'left', bold: false, italic: false }
          },
          {
            id: 'divider-1',
            type: 'line-horizontal',
            content: '',
            position: { x: 40, y: 120 },
            size: { width: 714, height: 2 },
            style: { fontSize: 2, fontFamily: 'Inter', color: '#E5E7EB', align: 'left', bold: false, italic: false }
          },
          {
            id: 'doctor-name',
            type: 'text',
            content: '{{doctor.name}}',
            position: { x: 40, y: 140 },
            size: { width: 300, height: 30 },
            style: { fontSize: 18, fontFamily: 'Inter', color: '#111827', align: 'left', bold: true, italic: false }
          },
          {
            id: 'doctor-degrees',
            type: 'text',
            content: '{{doctor.degrees}}',
            position: { x: 40, y: 170 },
            size: { width: 300, height: 20 },
            style: { fontSize: 14, fontFamily: 'Inter', color: '#4B5563', align: 'left', bold: false, italic: false }
          }
        ]
      },
      {
        id: 'modern-blue',
        name: 'Modern Blue',
        description: 'Professional blue accented design with a modern look. Ideal for clinics.',
        thumbnail: 'bg-blue-50',
        canvasBg: '#ffffff',
        printLayout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 0, right: 0, bottom: 20, left: 0 }
        },
        elements: [
          {
            id: 'header-bg',
            type: 'line-horizontal',
            content: '',
            position: { x: 0, y: 0 },
            size: { width: 794, height: 150 },
            style: { fontSize: 150, fontFamily: 'Inter', color: '#EFF6FF', align: 'left', bold: false, italic: false }
          },
          {
            id: 'header-title',
            type: 'text',
            content: '{{hospital.name}}',
            position: { x: 40, y: 40 },
            size: { width: 714, height: 40 },
            style: { fontSize: 28, fontFamily: 'Inter', color: '#1E40AF', align: 'center', bold: true, italic: false }
          },
          {
            id: 'header-subtitle',
            type: 'text',
            content: '{{hospital.address}} | {{hospital.phone}}',
            position: { x: 40, y: 90 },
            size: { width: 714, height: 20 },
            style: { fontSize: 14, fontFamily: 'Inter', color: '#3B82F6', align: 'center', bold: false, italic: false }
          },
          {
            id: 'doctor-section',
            type: 'text',
            content: '{{doctor.name}}\n{{doctor.degrees}}',
            position: { x: 40, y: 180 },
            size: { width: 300, height: 60 },
            style: { fontSize: 16, fontFamily: 'Inter', color: '#1F2937', align: 'left', bold: true, italic: false }
          },
          {
            id: 'vertical-divider',
            type: 'line-vertical',
            content: '',
            position: { x: 250, y: 250 },
            size: { width: 2, height: 600 },
            style: { fontSize: 14, fontFamily: 'Inter', color: '#BFDBFE', align: 'left', bold: false, italic: false }
          }
        ]
      },
      {
        id: 'classic-elegant',
        name: 'Classic Elegant',
        description: 'Traditional serif typography with a formal layout. Great for senior consultants.',
        thumbnail: 'bg-amber-50',
        canvasBg: '#FFFCF5',
        printLayout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 40, right: 40, bottom: 40, left: 40 }
        },
        elements: [
          {
            id: 'header-title',
            type: 'text',
            content: '{{hospital.name}}',
            position: { x: 0, y: 50 },
            size: { width: 794, height: 40 },
            style: { fontSize: 32, fontFamily: 'Times New Roman', color: '#451a03', align: 'center', bold: true, italic: false }
          },
          {
            id: 'divider-top',
            type: 'line-horizontal',
            content: '',
            position: { x: 100, y: 100 },
            size: { width: 594, height: 1 },
            style: { fontSize: 1, fontFamily: 'Inter', color: '#78350f', align: 'center', bold: false, italic: false }
          },
          {
            id: 'divider-bottom',
            type: 'line-horizontal',
            content: '',
            position: { x: 100, y: 105 },
            size: { width: 594, height: 3 },
            style: { fontSize: 3, fontFamily: 'Inter', color: '#78350f', align: 'center', bold: false, italic: false }
          },
          {
            id: 'doctor-name',
            type: 'text',
            content: '{{doctor.name}}',
            position: { x: 40, y: 150 },
            size: { width: 300, height: 30 },
            style: { fontSize: 20, fontFamily: 'Times New Roman', color: '#000000', align: 'left', bold: true, italic: false }
          },
          {
            id: 'rx-symbol',
            type: 'text',
            content: 'Rx',
            position: { x: 40, y: 250 },
            size: { width: 60, height: 60 },
            style: { fontSize: 48, fontFamily: 'Times New Roman', color: '#000000', align: 'left', bold: true, italic: true }
          }
        ]
      }
    ];
  }
};

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  canvasBg: string;
  printLayout: {
    pageSize: 'A4' | 'A5';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
  elements: any[];
}
