'use client';

import { useDraggable } from '@dnd-kit/core';

interface ElementToolboxProps {
  onAddElement: (type: string, dataField?: string) => void;
}

function ToolboxItem({ element, index }: { element: any; index: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `toolbox-${element.type}-${element.dataField || index}`,
    data: {
      type: element.type,
      dataField: element.dataField,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-full px-3 py-2 text-left text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-lg transition-all duration-200 flex items-center gap-2 group cursor-grab active:cursor-grabbing"
    >
      <span className="text-lg">{element.icon}</span>
      <span className="text-gray-700 group-hover:text-gray-900">{element.label}</span>
    </button>
  );
}

const ELEMENT_TYPES = [
  // Doctor Info
  { type: 'placeholder', dataField: 'doctor.name', label: '👨‍⚕️ Doctor Name', icon: '👨‍⚕️', category: 'Doctor' },
  { type: 'placeholder', dataField: 'doctor.degrees', label: '🎓 Degrees', icon: '🎓', category: 'Doctor' },
  { type: 'placeholder', dataField: 'doctor.email', label: '📧 Email', icon: '📧', category: 'Doctor' },
  { type: 'placeholder', dataField: 'doctor.bmdc', label: '🆔 BMDC', icon: '🆔', category: 'Doctor' },
  { type: 'placeholder', dataField: 'doctor.info_rich_text', label: '📝 Doctor Info (Rich Text)', icon: '📝', category: 'Doctor' },
  { type: 'placeholder', dataField: 'doctor.info_rich_text_bangla', label: '📝 Doctor Info (Bangla)', icon: '🇧🇩', category: 'Doctor' },
  
  // Hospital Info
  { type: 'placeholder', dataField: 'hospital.name', label: '🏥 Hospital Name', icon: '🏥', category: 'Hospital' },
  { type: 'placeholder', dataField: 'hospital.address', label: '📍 Address', icon: '📍', category: 'Hospital' },
  { type: 'placeholder', dataField: 'hospital.phone', label: '📞 Phone', icon: '📞', category: 'Hospital' },
  { type: 'placeholder', dataField: 'hospital.info_rich_text', label: '🏥 Hospital Info (Rich Text)', icon: '🏥', category: 'Hospital' },
  { type: 'placeholder', dataField: 'hospital.info_rich_text_bangla', label: '🏥 Hospital Info (Bangla)', icon: '🇧🇩', category: 'Hospital' },
  
  // Patient Info
  { type: 'placeholder', dataField: 'patient.name', label: '👤 Patient Name', icon: '👤', category: 'Patient' },
  { type: 'placeholder', dataField: 'patient.age', label: '🎂 Patient Age', icon: '🎂', category: 'Patient' },
  { type: 'placeholder', dataField: 'patient.gender', label: '⚧ Gender', icon: '⚧', category: 'Patient' },
  { type: 'placeholder', dataField: 'date', label: '📅 Date', icon: '📅', category: 'Patient' },
  
  // Prescription Sections
  { type: 'placeholder', dataField: 'medicines', label: '💊 Medicines (Rx)', icon: '💊', category: 'Prescription' },
  { type: 'placeholder', dataField: 'advice', label: '💡 Advice', icon: '💡', category: 'Prescription' },
  { type: 'placeholder', dataField: 'diagnosis', label: '🔍 Diagnosis', icon: '🔍', category: 'Prescription' },
  { type: 'placeholder', dataField: 'tests', label: '🧪 Tests', icon: '🧪', category: 'Prescription' },
  
  // General
  { type: 'text', label: '📝 Custom Text', icon: '📝', category: 'General' },
  { type: 'logo', label: '🖼️ Logo/Image', icon: '🖼️', category: 'General' },
  
  // Lines & Dividers
  { type: 'line-horizontal', label: '➖ Horizontal Line', icon: '➖', category: 'Lines' },
  { type: 'line-vertical', label: '⬇️ Vertical Line', icon: '⬇️', category: 'Lines' },
];

export default function ElementToolbox({ onAddElement }: ElementToolboxProps) {
  return (
    <div className="bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>🧰</span>
        Element Toolbox
      </h3>
      
      <div className="space-y-2">
        {ELEMENT_TYPES.map((element, index) => (
          <ToolboxItem key={index} element={element} index={index} />
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Drag elements onto the canvas to add them. Drag to position, double-click to edit.
        </p>
      </div>
    </div>
  );
}
