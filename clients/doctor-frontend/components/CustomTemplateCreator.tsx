'use client';

import { useState } from 'react';
import { printTemplateAPI } from '@/lib/api';

interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  htmlContent: string;
  cssContent: string;
  colorScheme?: {
    primary: string;
    accent: string;
    background: string;
  };
}

interface CustomTemplateCreatorProps {
  onClose: () => void;
  onSave: (template: Template) => void;
  hospitals: any[];
  baseTemplates: Template[];
  hospitalData?: any; // Hospital form data for preview
}

export default function CustomTemplateCreator({
  onClose,
  onSave,
  hospitals,
  baseTemplates,
  hospitalData,
}: CustomTemplateCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseTemplateId: '',
    doctorId: '',
    colorScheme: {
      primary: '#2563eb',
      accent: '#3b82f6',
      background: '#eff6ff',
    },
  });
  const [saving, setSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleColorChange = (field: 'primary' | 'accent' | 'background', value: string) => {
    setFormData({
      ...formData,
      colorScheme: {
        ...formData.colorScheme,
        [field]: value,
      },
    });
  };

  const handleBaseTemplateChange = (templateId: string) => {
    const template = baseTemplates.find((t) => t._id === templateId);
    setFormData({
      ...formData,
      baseTemplateId: templateId,
    });
    if (template) {
      setPreviewTemplate(template);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.baseTemplateId) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await printTemplateAPI.clone(formData.baseTemplateId, {
        ...formData.colorScheme,
        name: formData.name,
        description: formData.description,
        doctorId: formData.doctorId || undefined,
      });
      onSave(response.data);
    } catch (error: any) {
      alert('Error creating template: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Generate preview with custom colors
  const getPreviewTemplate = () => {
    if (!previewTemplate) return null;
    
    return {
      ...previewTemplate,
      colorScheme: formData.colorScheme,
      cssContent: previewTemplate.cssContent
        .replace(/var\(--primary-color, [^)]+\)/g, formData.colorScheme.primary)
        .replace(/var\(--accent-color, [^)]+\)/g, formData.colorScheme.accent)
        .replace(/var\(--background-color, [^)]+\)/g, formData.colorScheme.background)
        .replace(/#2563eb/g, formData.colorScheme.primary)
        .replace(/#3b82f6/g, formData.colorScheme.accent)
        .replace(/#eff6ff/g, formData.colorScheme.background),
    };
  };

  const preview = getPreviewTemplate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                ✨ Create Custom Template
              </h2>
              <p className="text-sm text-gray-600">
                Customize colors and settings for your prescription template
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
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  Template Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="My Custom Template"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                      placeholder="Describe your template..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Template *
                    </label>
                    <select
                      value={formData.baseTemplateId}
                      onChange={(e) => handleBaseTemplateChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a base template...</option>
                      {baseTemplates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Doctor (Optional)
                    </label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">No specific doctor</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital.doctorId}>
                          {hospital.doctorInfo?.name || hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  Color Scheme
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={formData.colorScheme.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.colorScheme.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={formData.colorScheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.colorScheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={formData.colorScheme.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.colorScheme.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#eff6ff"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">👁️</span>
                Live Preview
              </h3>
              {preview ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-y-auto max-h-[600px] p-8">
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%' }}>
                      <style>{preview.cssContent}</style>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: preview.htmlContent
                            .replace('{{doctor.name}}', hospitalData?.doctorInfo?.name || 'Dr. John Doe')
                            .replace('{{doctor.degrees}}', hospitalData?.doctorInfo?.degrees?.join(', ') || 'MBBS, FCPS')
                            .replace('{{doctor.bmdc}}', hospitalData?.doctorInfo?.bmdcNumber || 'A-12345')
                            .replace('{{hospital.name}}', hospitalData?.headerStructured?.clinicName || hospitalData?.name || 'Sample Hospital')
                            .replace('{{hospital.address}}', hospitalData?.headerStructured?.address || '123 Medical St')
                            .replace('{{hospital.phone}}', hospitalData?.headerStructured?.phone || '01712345678')
                            .replace('{{patient.name}}', 'Patient Name')
                            .replace('{{patient.age}}', '30')
                            .replace('{{patient.gender}}', 'Male')
                            .replace('{{date}}', new Date().toLocaleDateString())
                            .replace('{{content.left}}', '<p><strong>Tests:</strong><br/>CBC</p>')
                            .replace('{{content.right}}', '<p>Tab. Medicine<br/>1+1+1</p>')
                            .replace('{{nextVisit}}', hospitalData?.footerSettings?.defaultNextVisitDay || '7 days')
                            .replace('{{showTime}}', hospitalData?.footerSettings?.showTime || '10 AM - 2 PM'),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500">Select a base template to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.baseTemplateId}
            className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </>
            ) : (
              <>
                <span>✨</span>
                Create Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
