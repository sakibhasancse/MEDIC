'use client';

import { useState, useEffect } from 'react';
import { printTemplateAPI, hospitalAPI } from '@/lib/api';
import CustomTemplateCreator from '@/components/CustomTemplateCreator';

interface Template {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  htmlContent: string;
  cssContent: string;
  category: string;
  colorScheme?: {
    primary: string;
    accent: string;
    background: string;
  };
}

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId?: string;
  onSelect: (templateId: string) => void;
  hospitalData?: any; // Hospital form data for preview
}

export default function TemplateGalleryModal({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelect,
  hospitalData,
}: TemplateGalleryModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadHospitals();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      await printTemplateAPI.seed();
      const response = await printTemplateAPI.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const response = await hospitalAPI.getAll();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const handleCustomTemplateCreated = async (newTemplate: Template) => {
    setShowCustomCreator(false);
    await loadTemplates();
    onSelect(newTemplate._id);
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  if (!isOpen) return null;

  if (showCustomCreator) {
    return (
      <CustomTemplateCreator
        onClose={() => setShowCustomCreator(false)}
        onSave={handleCustomTemplateCreated}
        hospitals={hospitals}
        baseTemplates={templates.filter((t) => t.category)}
        hospitalData={hospitalData}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                🎨 Template Gallery
              </h2>
              <p className="text-sm text-gray-600">
                Choose a beautiful template for your prescriptions
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading templates...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    {category} Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryTemplates.map((template) => (
                      <div
                        key={template._id}
                        className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          selectedTemplateId === template._id
                            ? 'border-blue-500 ring-4 ring-blue-200 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => onSelect(template._id)}
                      >
                        {/* Color Preview */}
                        <div
                          className="h-32 flex items-center justify-center relative overflow-hidden"
                          style={{
                            background: template.colorScheme
                              ? `linear-gradient(135deg, ${template.colorScheme.primary} 0%, ${template.colorScheme.accent} 100%)`
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                          <div className="relative text-white text-center p-4">
                            <div className="text-3xl mb-2">📄</div>
                            <div className="text-xs font-medium opacity-90">
                              {template.colorScheme ? (
                                <div className="flex gap-1 justify-center">
                                  <div
                                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                                    style={{ backgroundColor: template.colorScheme.primary }}
                                  ></div>
                                  <div
                                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                                    style={{ backgroundColor: template.colorScheme.accent }}
                                  ></div>
                                </div>
                              ) : (
                                'Preview'
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Template Info */}
                        <div className="p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {template.name}
                            </h4>
                            {selectedTemplateId === template._id && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                            {template.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            👁️ Preview
                          </button>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={() => setShowCustomCreator(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-lg">✨</span>
            Create Custom Template
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{previewTemplate.name} Preview</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
              <div
                className="bg-white shadow-2xl mx-auto rounded-lg"
                style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
              >
                <style>{previewTemplate.cssContent}</style>
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewTemplate.htmlContent
                      .replace('{{doctor.name}}', hospitalData?.doctorInfo?.name || 'Dr. John Doe')
                      .replace('{{doctor.degrees}}', hospitalData?.doctorInfo?.degrees?.join(', ') || 'MBBS, FCPS (Medicine)')
                      .replace('{{doctor.bmdc}}', hospitalData?.doctorInfo?.bmdcNumber ? `Reg: ${hospitalData.doctorInfo.bmdcNumber}` : 'Reg: A-12345')
                      .replace('{{hospital.name}}', hospitalData?.headerStructured?.clinicName || hospitalData?.name || 'City General Hospital')
                      .replace('{{hospital.address}}', hospitalData?.headerStructured?.address || '123 Medical Road, City')
                      .replace('{{hospital.phone}}', hospitalData?.headerStructured?.phone || '01712345678')
                      .replace('{{patient.name}}', 'Mr. Patient Name')
                      .replace('{{patient.age}}', '30')
                      .replace('{{patient.gender}}', 'Male')
                      .replace('{{date}}', new Date().toLocaleDateString())
                      .replace('{{content.left}}', '<p><strong>Tests:</strong><br/>1. CBC<br/>2. X-Ray Chest</p>')
                      .replace('{{content.right}}', '<p><strong>Rx</strong><br/>1. Tab. Paracetamol 500mg<br/>1+1+1 (3 days)</p>')
                      .replace('{{nextVisit}}', hospitalData?.footerSettings?.defaultNextVisitDay || '7 days')
                      .replace('{{showTime}}', hospitalData?.footerSettings?.showTime || '10:00 AM - 2:00 PM'),
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelect(previewTemplate._id);
                  setPreviewTemplate(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
              >
                Select This Template
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
