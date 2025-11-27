'use client';

import { useState } from 'react';

interface BodyEditorProps {
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
}

const SECTION_TYPES = [
  { id: 'patient-info', label: 'Patient Information', icon: '👤', description: 'Name, Age, Gender' },
  { id: 'medicines', label: 'Medicines (Rx)', icon: '💊', description: 'Prescription list' },
  { id: 'advice', label: 'Advice', icon: '💡', description: 'Medical advice' },
  { id: 'diagnosis', label: 'Diagnosis', icon: '🔍', description: 'Diagnosis list' },
  { id: 'tests', label: 'Tests', icon: '🧪', description: 'Recommended tests' },
];

export default function BodyEditor({
  backgroundColor,
  onBackgroundChange,
}: BodyEditorProps) {
  const [enabledSections, setEnabledSections] = useState<string[]>(['patient-info', 'medicines', 'advice']);

  const toggleSection = (sectionId: string) => {
    if (enabledSections.includes(sectionId)) {
      setEnabledSections(enabledSections.filter((id) => id !== sectionId));
    } else {
      setEnabledSections([...enabledSections, sectionId]);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-700">Background:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundChange(e.target.value)}
            className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <span className="text-xs text-gray-600">{backgroundColor}</span>
        </div>
      </div>

      {/* Section Selector */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Enable/Disable Sections:</h4>
        <div className="grid grid-cols-2 gap-2">
          {SECTION_TYPES.map((section) => (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`p-3 text-left border-2 rounded-lg transition-all ${
                enabledSections.includes(section.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{section.icon}</span>
                <span className="text-sm font-medium text-gray-900">{section.label}</span>
                {enabledSections.includes(section.id) && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600">{section.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div
          className="bg-white shadow-lg mx-auto p-8"
          style={{
            width: '210mm',
            minHeight: '400px',
            backgroundColor,
          }}
        >
          <div className="space-y-6">
            {enabledSections.includes('patient-info') && (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">👤 Patient Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {'{{patient.name}}'}</p>
                  <p><strong>Age:</strong> {'{{patient.age}}'} | <strong>Gender:</strong> {'{{patient.gender}}'}</p>
                  <p><strong>Date:</strong> {'{{date}}'}</p>
                </div>
              </div>
            )}

            {enabledSections.includes('medicines') && (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">💊 Rx (Medicines)</h3>
                <div className="text-sm text-gray-600">
                  <p>Medicine list will appear here...</p>
                </div>
              </div>
            )}

            {enabledSections.includes('advice') && (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Advice</h3>
                <div className="text-sm text-gray-600">
                  <p>Medical advice will appear here...</p>
                </div>
              </div>
            )}

            {enabledSections.includes('diagnosis') && (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">🔍 Diagnosis</h3>
                <div className="text-sm text-gray-600">
                  <p>Diagnosis will appear here...</p>
                </div>
              </div>
            )}

            {enabledSections.includes('tests') && (
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">🧪 Recommended Tests</h3>
                <div className="text-sm text-gray-600">
                  <p>Test recommendations will appear here...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
