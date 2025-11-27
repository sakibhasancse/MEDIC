import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { printTemplateAPI } from '@/lib/api';
import { generateTemplateHTML } from '@/lib/htmlGenerator';

interface TemplateGalleryProps {
  selectedTemplateId?: string;
  doctorId: string;
  onSelectTemplate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onClose: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ selectedTemplateId, doctorId, onSelectTemplate, onEditTemplate, onClose }) => {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await printTemplateAPI.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (templateId: string, field: 'name' | 'description', currentValue: string) => {
    setEditingId(templateId);
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = async (templateId: string) => {
    if (!editingField) return;
    
    // Validate name
    if (editingField === 'name' && (!editValue || editValue.trim().length < 2)) {
      alert('Template name must be at least 2 characters');
      return;
    }

    try {
      await printTemplateAPI.update(templateId, {
        [editingField]: editValue.trim()
      });
      
      // Update local state
      setTemplates(templates.map(t => 
        t._id === templateId 
          ? { ...t, [editingField]: editValue.trim() }
          : t
      ));
      
      setEditingId(null);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleCreateNew = async () => {
    try {
      const design = {
        elements: [],
        printLayout: { pageSize: 'A4', orientation: 'portrait', margins: { top: 20, right: 20, bottom: 20, left: 20 } },
        canvasBg: '#ffffff'
      };

      // Generate valid HTML/CSS for the empty template to satisfy backend validation
      const { html, css } = generateTemplateHTML(design.elements as any, design.printLayout);

      const newTemplate = {
        name: 'New Template',
        description: 'Custom template',
        htmlContent: html,
        cssContent: css,
        design
      };
      const response = await printTemplateAPI.create(newTemplate);
      // onEditTemplate(response.data._id);
      router.push(`/templates/${response.data._id}/edit`);
    } catch (error) {
      alert('Error creating template');
    }
  };

  const handleCustomize = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    try {
      const response = await printTemplateAPI.customize(templateId, doctorId);
      onEditTemplate(response.data._id);
    } catch (error) {
      console.error('Error customizing template:', error);
      alert('Failed to customize template');
    }
  };

  const handleReset = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to reset this template to default? All custom changes will be lost.')) {
      try {
        const response = await printTemplateAPI.resetToDefault(templateId, doctorId);
        // If the reset template was selected, select the base template
        if (selectedTemplateId === templateId) {
          onSelectTemplate(response.data.baseTemplateId);
        }
        loadTemplates();
      } catch (error) {
        console.error('Error resetting template:', error);
        alert('Failed to reset template');
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await printTemplateAPI.delete(id);
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const systemTemplates = templates.filter(t => t.isSystem);
  const myTemplates = templates.filter(t => !t.isSystem);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Gallery</h2>
            <p className="text-sm text-gray-600 mt-1">Select a template for your hospital or design a new one</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* My Templates Section */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>👤</span> My Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Create New Option */}
                  <div 
                    onClick={handleCreateNew}
                    className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col h-64 justify-center items-center"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Create New Template</h3>
                    <p className="text-sm text-gray-500 mt-2">Start from scratch</p>
                  </div>

                  {myTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template._id;
                    return (
                      <div
                        key={template._id}
                        className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative ${
                          isSelected 
                            ? 'border-2 border-green-500 ring-4 ring-green-100' 
                            : 'border border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        {/* Preview Area */}
                        <div className={`h-40 relative overflow-hidden border-b ${
                          isSelected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="absolute inset-4 bg-white shadow-sm opacity-50 rounded flex flex-col p-2 gap-2">
                            <div className="h-2 w-1/3 bg-gray-300 rounded"></div>
                            <div className="h-1 w-1/2 bg-gray-200 rounded"></div>
                          </div>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => onSelectTemplate(template._id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all ${
                                isSelected
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select'}
                            </button>
                            <button
                              onClick={() => router.push(`/templates/${template._id}/edit`)}
                              className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-50 transform translate-y-2 group-hover:translate-y-0 transition-all"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {editingId === template._id && editingField === 'name' ? (
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleSaveEdit(template._id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEdit(template._id);
                                      if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                    autoFocus
                                    className="flex-1 px-2 py-1 text-lg font-bold border-2 border-blue-500 rounded focus:outline-none"
                                    maxLength={50}
                                  />
                                ) : (
                                  <h3 
                                    onClick={() => handleStartEdit(template._id, 'name', template.name)}
                                    className={`text-lg font-bold transition-colors cursor-pointer hover:text-blue-600 group/name flex items-center gap-1 ${
                                      isSelected ? 'text-green-900' : 'text-gray-900'
                                    }`}
                                  >
                                    {template.name}
                                    <svg className="w-4 h-4 opacity-0 group-hover/name:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </h3>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {template.description || 'No description'}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {template.baseTemplateId && (
                                <button 
                                  onClick={(e) => handleReset(e, template._id)}
                                  className="text-gray-400 hover:text-orange-500 p-1"
                                  title="Reset to Default"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              )}
                              <button 
                                onClick={(e) => handleDelete(e, template._id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                                title="Delete Template"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* System Templates Section */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>🏢</span> System Defaults
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {systemTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template._id;
                    return (
                      <div
                        key={template._id}
                        className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative ${
                          isSelected 
                            ? 'border-2 border-green-500 ring-4 ring-green-100' 
                            : 'border border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        <div className={`h-40 relative overflow-hidden border-b ${
                          isSelected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="absolute inset-4 bg-white shadow-sm opacity-50 rounded flex flex-col p-2 gap-2">
                            <div className="h-2 w-1/3 bg-gray-300 rounded"></div>
                            <div className="h-1 w-1/2 bg-gray-200 rounded"></div>
                          </div>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => onSelectTemplate(template._id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all ${
                                isSelected
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select'}
                            </button>
                            <button
                              onClick={(e) => handleCustomize(e, template._id)}
                              className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-50 transform translate-y-2 group-hover:translate-y-0 transition-all"
                            >
                              Customize
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className={`text-lg font-bold ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
