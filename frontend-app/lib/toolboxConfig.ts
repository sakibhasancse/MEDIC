import { ToolboxElement } from '@/types/templateV2';
import {
  Person,
  School,
  Email,
  Badge,
  LocalHospital,
  LocationOn,
  Phone,
  AccountCircle,
  Cake,
  Wc,
  CalendarToday,
  Medication,
  Lightbulb,
  Search,
  Science,
  TextFields,
  Image,
  HorizontalRule,
  MoreVert,
  CropSquare,
} from '@mui/icons-material';

// Toolbox element definitions with Material Design icons
export const TOOLBOX_ELEMENTS: ToolboxElement[] = [
  // Doctor Information
  {
    type: 'placeholder',
    dataField: 'doctor.name',
    label: 'Doctor Name',
    icon: 'Person',
    category: 'Doctor',
    description: 'Doctor\'s full name',
  },
  {
    type: 'placeholder',
    dataField: 'doctor.degrees',
    label: 'Degrees',
    icon: 'School',
    category: 'Doctor',
    description: 'Medical degrees and qualifications',
  },
  {
    type: 'placeholder',
    dataField: 'doctor.email',
    label: 'Email',
    icon: 'Email',
    category: 'Doctor',
    description: 'Doctor\'s email address',
  },
  {
    type: 'placeholder',
    dataField: 'doctor.bmdc',
    label: 'BMDC Registration',
    icon: 'Badge',
    category: 'Doctor',
    description: 'BMDC registration number',
  },
  {
    type: 'placeholder',
    dataField: 'doctor.info_rich_text',
    label: 'Doctor Info (Rich Text)',
    icon: 'Person',
    category: 'Doctor',
    description: 'Complete doctor information with formatting',
  },
  {
    type: 'placeholder',
    dataField: 'doctor.info_rich_text_bangla',
    label: 'Doctor Info (Bangla)',
    icon: 'Person',
    category: 'Doctor',
    description: 'Doctor information in Bangla',
  },

  // Hospital Information
  {
    type: 'placeholder',
    dataField: 'hospital.name',
    label: 'Hospital Name',
    icon: 'LocalHospital',
    category: 'Hospital',
    description: 'Hospital or clinic name',
  },
  {
    type: 'placeholder',
    dataField: 'hospital.address',
    label: 'Address',
    icon: 'LocationOn',
    category: 'Hospital',
    description: 'Hospital address',
  },
  {
    type: 'placeholder',
    dataField: 'hospital.phone',
    label: 'Phone',
    icon: 'Phone',
    category: 'Hospital',
    description: 'Hospital contact number',
  },
  {
    type: 'placeholder',
    dataField: 'hospital.email',
    label: 'Email',
    icon: 'Email',
    category: 'Hospital',
    description: 'Hospital email address',
  },
  {
    type: 'placeholder',
    dataField: 'hospital.info_rich_text',
    label: 'Hospital Info (Rich Text)',
    icon: 'LocalHospital',
    category: 'Hospital',
    description: 'Complete hospital information with formatting',
  },
  {
    type: 'placeholder',
    dataField: 'hospital.info_rich_text_bangla',
    label: 'Hospital Info (Bangla)',
    icon: 'LocalHospital',
    category: 'Hospital',
    description: 'Hospital information in Bangla',
  },

  // Patient Information
  {
    type: 'placeholder',
    dataField: 'patient.name',
    label: 'Patient Name',
    icon: 'AccountCircle',
    category: 'Patient',
    description: 'Patient\'s full name',
  },
  {
    type: 'placeholder',
    dataField: 'patient.age',
    label: 'Patient Age',
    icon: 'Cake',
    category: 'Patient',
    description: 'Patient\'s age',
  },
  {
    type: 'placeholder',
    dataField: 'patient.gender',
    label: 'Gender',
    icon: 'Wc',
    category: 'Patient',
    description: 'Patient\'s gender',
  },
  {
    type: 'placeholder',
    dataField: 'patient.phone',
    label: 'Phone',
    icon: 'Phone',
    category: 'Patient',
    description: 'Patient contact number',
  },
  {
    type: 'placeholder',
    dataField: 'date',
    label: 'Date',
    icon: 'CalendarToday',
    category: 'Patient',
    description: 'Prescription date',
  },

  // Prescription Sections
  {
    type: 'placeholder',
    dataField: 'medicines',
    label: 'Medicines (Rx)',
    icon: 'Medication',
    category: 'Prescription',
    description: 'Medicine list table',
  },
  {
    type: 'placeholder',
    dataField: 'advice',
    label: 'Advice',
    icon: 'Lightbulb',
    category: 'Prescription',
    description: 'Medical advice section',
  },
  {
    type: 'placeholder',
    dataField: 'diagnosis',
    label: 'Diagnosis',
    icon: 'Search',
    category: 'Prescription',
    description: 'Diagnosis information',
  },
  {
    type: 'placeholder',
    dataField: 'tests',
    label: 'Tests',
    icon: 'Science',
    category: 'Prescription',
    description: 'Recommended tests',
  },

  // General Elements
  {
    type: 'text',
    label: 'Custom Text',
    icon: 'TextFields',
    category: 'General',
    description: 'Add custom text field',
  },
  {
    type: 'logo',
    label: 'Logo/Image',
    icon: 'Image',
    category: 'General',
    description: 'Add logo or image',
  },

  // Lines & Shapes
  {
    type: 'line-horizontal',
    label: 'Horizontal Line',
    icon: 'HorizontalRule',
    category: 'Lines',
    description: 'Add horizontal divider line',
  },
  {
    type: 'line-vertical',
    label: 'Vertical Line',
    icon: 'MoreVert',
    category: 'Lines',
    description: 'Add vertical divider line',
  },
  {
    type: 'box',
    label: 'Box',
    icon: 'CropSquare',
    category: 'Shapes',
    description: 'Add rectangular box',
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: 'HorizontalRule',
    category: 'Shapes',
    description: 'Add styled divider',
  },
];

// Group elements by category
export const TOOLBOX_CATEGORIES = [
  'Doctor',
  'Hospital',
  'Patient',
  'Prescription',
  'General',
  'Lines',
  'Shapes',
] as const;

export function getElementsByCategory(category: typeof TOOLBOX_CATEGORIES[number]): ToolboxElement[] {
  return TOOLBOX_ELEMENTS.filter((element) => element.category === category);
}

// Icon mapping for dynamic rendering
export const ICON_MAP: Record<string, any> = {
  Person,
  School,
  Email,
  Badge,
  LocalHospital,
  LocationOn,
  Phone,
  AccountCircle,
  Cake,
  Wc,
  CalendarToday,
  Medication,
  Lightbulb,
  Search,
  Science,
  TextFields,
  Image,
  HorizontalRule,
  MoreVert,
  CropSquare,
};
