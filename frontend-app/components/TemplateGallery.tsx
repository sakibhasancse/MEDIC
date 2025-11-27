'use client';

import { useState, useEffect } from 'react';
import { printTemplateAPI } from '@/lib/api';

interface Template {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  htmlContent: string;
  cssContent: string;
}

interface TemplateGalleryProps {
  selectedTemplateId?: string;
  onSelect: (templateId: string) => void;
}

export default function TemplateGallery({ selectedTemplateId, onSelect }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Seed defaults first if needed (in a real app, this would be done once by admin)
      await printTemplateAPI.seed();
      
      const response = await printTemplateAPI.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template._id;
          return (
            <div
              key={template._id}
              className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => onSelect(template._id)}
            >
              {/* Thumbnail */}
              <div className={`h-40 bg-gray-100 flex items-center justify-center border-b relative ${
                isSelected ? 'border-green-200 bg-green-50' : 'border-gray-100'
              }`}>
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} className="h-full w-full object-cover" />
                ) : (
                  <div className={`text-4xl ${isSelected ? 'text-green-500' : 'text-gray-400'}`}>📄</div>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                    {template.name}
                  </h3>
                  {isSelected && (
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {template.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(template._id);
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg text-white transition font-medium ${
                      isSelected
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSelected ? '✓ Active' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">{previewTemplate.name} Preview</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
                <style>{previewTemplate.cssContent}</style>
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewTemplate.htmlContent
                      .replace('{{doctor.name}}', 'Dr. John Doe')
                      .replace('{{doctor.degrees}}', 'MBBS, FCPS (Medicine)')
                      .replace('{{doctor.bmdc}}', 'Reg: A-12345')
                      .replace('{{hospital.name}}', 'City General Hospital')
                      .replace('{{hospital.address}}', '123 Medical Road, City')
                      .replace('{{hospital.phone}}', '01712345678')
                      .replace('{{patient.name}}', 'Mr. Patient Name')
                      .replace('{{patient.age}}', '30')
                      .replace('{{patient.gender}}', 'Male')
                      .replace('{{date}}', new Date().toLocaleDateString())
                      .replace('{{content.left}}', '<p><strong>Tests:</strong><br/>1. CBC<br/>2. X-Ray Chest</p>')
                      .replace('{{content.right}}', '<p><strong>Rx</strong><br/>1. Tab. Paracetamol 500mg<br/>1+1+1 (3 days)</p>')
                      .replace('{{nextVisit}}', '7 days')
                      .replace('{{showTime}}', '10:00 AM - 2:00 PM')
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelect(previewTemplate._id);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Select This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
