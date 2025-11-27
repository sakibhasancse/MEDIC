// Placeholder data for template preview mode

export const PLACEHOLDER_DATA = {
  // Doctor Information
  'doctor.name': 'Dr. Sarah Johnson',
  'doctor.degrees': 'MBBS, MD (Medicine)',
  'doctor.bmdc': 'Reg: A-12345',
  'doctor.email': 'dr.sarah@example.com',
  'doctor.phone': '+880 1712-345678',
  'doctor.info_rich_text': '<div style="text-align:center"><strong>Dr. Sarah Johnson</strong><br/>MBBS, MD (Medicine)<br/>Reg: A-12345<br/>Specialist in Internal Medicine</div>',
  'doctor.info_rich_text_bangla': '<div style="text-align:center"><strong>ডাঃ সারাহ জনসন</strong><br/>এমবিবিএস, এমডি (মেডিসিন)<br/>রেজিঃ এ-১২৩৪৫<br/>ইন্টারনাল মেডিসিন বিশেষজ্ঞ</div>',

  // Hospital Information
  'hospital.name': 'City General Hospital',
  'hospital.address': '123 Medical Road, Dhaka-1205',
  'hospital.phone': '+880 1712-345678',
  'hospital.email': 'info@cityhospital.com',
  'hospital.info_rich_text': '<div style="text-align:center"><strong>City General Hospital</strong><br/>123 Medical Road, Dhaka-1205<br/>Phone: +880 1712-345678<br/>Email: info@cityhospital.com</div>',
  'hospital.info_rich_text_bangla': '<div style="text-align:center"><strong>সিটি জেনারেল হাসপাতাল</strong><br/>১২৩ মেডিকেল রোড, ঢাকা-১২০৫<br/>ফোনঃ +৮৮০ ১৭১২-৩৪৫৬৭৮<br/>ইমেইলঃ info@cityhospital.com</div>',

  // Patient Information
  'patient.name': 'John Doe',
  'patient.age': '35 years',
  'patient.gender': 'Male',
  'patient.phone': '+880 1798-765432',
  'patient.address': '456 Patient Street, Dhaka',

  // Date
  'date': new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),

  // Prescription Sections
  'medicines': `
    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="border-bottom: 2px solid #333;">
          <th style="text-align: left; padding: 8px;">Medicine</th>
          <th style="text-align: left; padding: 8px;">Dosage</th>
          <th style="text-align: left; padding: 8px;">Duration</th>
          <th style="text-align: left; padding: 8px;">Instructions</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px;">Paracetamol 500mg</td>
          <td style="padding: 8px;">1+0+1</td>
          <td style="padding: 8px;">7 days</td>
          <td style="padding: 8px;">After meal</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px;">Omeprazole 20mg</td>
          <td style="padding: 8px;">1+0+0</td>
          <td style="padding: 8px;">14 days</td>
          <td style="padding: 8px;">Before breakfast</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px;">Amoxicillin 500mg</td>
          <td style="padding: 8px;">1+0+1</td>
          <td style="padding: 8px;">5 days</td>
          <td style="padding: 8px;">After meal</td>
        </tr>
      </tbody>
    </table>
  `,

  'advice': `
    <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
      <li>Take complete rest for 3 days</li>
      <li>Drink plenty of water (at least 8 glasses per day)</li>
      <li>Avoid oily and spicy food</li>
      <li>Take medicines on time</li>
      <li>Follow up after 7 days</li>
    </ul>
  `,

  'diagnosis': `
    <div style="line-height: 1.6;">
      <strong>Provisional Diagnosis:</strong><br/>
      • Acute Gastritis<br/>
      • Upper Respiratory Tract Infection (URTI)
    </div>
  `,

  'tests': `
    <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
      <li>Complete Blood Count (CBC)</li>
      <li>Chest X-Ray (PA View)</li>
      <li>Blood Sugar (Fasting)</li>
    </ul>
  `,
};

/**
 * Get placeholder content for a given data field
 */
export function getPlaceholderContent(dataField: string): string {
  return PLACEHOLDER_DATA[dataField as keyof typeof PLACEHOLDER_DATA] || '';
}

/**
 * Replace all placeholders in content with preview data
 */
export function replacePlaceholders(content: string): string {
  let result = content;

  // Replace {{placeholder}} syntax
  Object.entries(PLACEHOLDER_DATA).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Check if content is HTML
 */
export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}
