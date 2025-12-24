'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Element } from '@/types/template';
import ElementToolbox from './ElementToolbox';
import StylePanel from './StylePanel';
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import DraggableElement from './DraggableElement';
import { printTemplateAPI } from '@/lib/api';
import { templateDataService } from '@/lib/templateDataService';
import { TemplateGallery } from './TemplateGallery';
import { generateTemplateHTML } from '@/lib/htmlGenerator';
import { validateTemplateName } from '@/lib/validation';
import FormError from '@/components/FormError';

interface TemplateEditorProps {
  templateId: string;
  onBack?: () => void;
}



export default function TemplateEditor({
  templateId,
  onBack,
}: TemplateEditorProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Template metadata
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [nameError, setNameError] = useState('');
  
  // All elements on one canvas
  const [elements, setElements] = useState<Element[]>([]);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  
  const defaultPrintLayout = {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    showBorders: false,
  };

  // Print layout settings
  const [printLayout, setPrintLayout] = useState(defaultPrintLayout);
  
  // Selection state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Drag state for showing preview
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  // Responsive state
  const [showToolbox, setShowToolbox] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  // Responsive breakpoints
  const BREAKPOINT_SMALL = 768;
  const BREAKPOINT_MEDIUM = 1280;

  // Window resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Auto-collapse panels based on screen size
      if (width < BREAKPOINT_SMALL) {
        // Small screens: hide both panels
        setShowToolbox(false);
        setShowProperties(false);
      } else if (width < BREAKPOINT_MEDIUM) {
        // Medium screens: hide right panel only
        setShowToolbox(true);
        setShowProperties(false);
      } else {
        // Large screens: show both panels
        setShowToolbox(true);
        setShowProperties(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const { setNodeRef } = useDroppable({
    id: 'main-canvas',
  });



  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // If dragging from toolbox, store the data for preview
    if (active.id.toString().startsWith('toolbox-')) {
      setActiveDragItem(active.data.current);
    } else {
      // If dragging an existing element, find it
      const element = elements.find(el => el.id === active.id);
      setActiveDragItem(element);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    console.log('Drag end:', { active, over, delta });

    // Handle dropping new elements from toolbox
    if (active.id.toString().startsWith('toolbox-')) {
      const data = active.data.current;
      const canvasRect = document.getElementById('main-canvas')?.getBoundingClientRect();
      
      console.log('Drop detected from toolbox!', { data, canvasRect, delta, event });
      
      if (canvasRect && data && active.rect.current.translated) {
        // Use the final translated position of the dragged item
        const { left, top } = active.rect.current.translated;
        
        // Calculate position relative to canvas
        const dropX = left - canvasRect.left;
        const dropY = top - canvasRect.top;
        
        console.log('Creating element at:', { dropX, dropY });
        
        // Ensure we don't drop outside (optional, but good for UX)
        // if (dropX >= 0 && dropY >= 0 && dropX <= canvasRect.width && dropY <= canvasRect.height) {
          handleAddElement(data.type, data.dataField, dropX, dropY);
        // }
      }
      return;
    }
    
    // Handle dragging existing elements (repositioning)
    const elementId = active.id as string;
    const updatedElements = elements.map((el) => {
      if (el.id === elementId) {
        return {
          ...el,
          position: {
            x: Math.max(0, el.position.x + delta.x),
            y: Math.max(0, el.position.y + delta.y),
          },
        };
      }
      return el;
    });
    
    setElements(updatedElements);
    
    // Clear the drag preview
    setActiveDragItem(null);
  };

  const handleAddElement = (type: string, dataField?: string, x: number = 50, y: number = 50) => {
    const isHorizontalLine = type === 'line-horizontal';
    const isVerticalLine = type === 'line-vertical';
    const isLogo = type === 'logo' || type === 'image';
    
    // Generate user-friendly content based on dataField
    let displayContent = 'New Element';
    if (dataField) {
      // Convert dataField to readable label (e.g., 'doctor.name' -> 'Doctor Name')
      const parts = dataField.split('.');
      displayContent = parts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    } else if (isHorizontalLine || isVerticalLine) {
      displayContent = '';
    } else if (isLogo) {
      displayContent = 'Logo';
    }
    
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type: type as any,
      content: displayContent,
      dataField,
      position: { x, y },
      size: { 
        width: isHorizontalLine ? 600 : (isVerticalLine ? 2 : (isLogo ? 100 : 200)), 
        height: isHorizontalLine ? 2 : (isVerticalLine ? 400 : (isLogo ? 100 : 40)) 
      },
      style: {
        fontSize: isHorizontalLine || isVerticalLine ? 2 : 14,
        fontFamily: 'Arial',
        color: '#000000', // Black text for visibility
        align: 'left',
        bold: false,
        italic: false,
      },
    };

    setElements([...elements, newElement]);
  };

  const handleUpdateElement = (id: string, updates: Partial<Element>) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(updatedElements);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Helper function to populate preview data
  const getPreviewContent = (element: Element): string => {
    if (!element.content && !element.dataField) return '';
    
    // If element has a dataField, use it to generate preview content
    if (element.dataField) {
      const dummyDataMap: Record<string, string> = {
        'doctor.name': 'Dr. Sarah Johnson',
        'doctor.degrees': 'MBBS, MD (Medicine)',
        'doctor.bmdc': 'Reg: A-12345',
        'doctor.email': 'dr.sarah@example.com',
        'doctor.info_rich_text': '<strong>Dr. Sarah Johnson</strong><br/>MBBS, MD (Medicine)<br/>Reg: A-12345',
        'doctor.info_rich_text_bangla': '<strong>ডাঃ সারাহ জনসন</strong><br/>এমবিবিএস, এমডি (মেডিসিন)<br/>রেজিঃ এ-১২৩৪৫',
        'hospital.name': 'City General Hospital',
        'hospital.address': '123 Medical Road, Dhaka',
        'hospital.phone': '+880 1712-345678',
        'hospital.email': 'info@cityhospital.com',
        'hospital.info_rich_text': '<div style="text-align:center"><strong>City General Hospital</strong><br/>123 Medical Road, Dhaka<br/>Phone: +880 1712-345678</div>',
        'hospital.info_rich_text_bangla': '<div style="text-align:center"><strong>সিটি জেনারেল হাসপাতাল</strong><br/>১২৩ মেডিকেল রোড, ঢাকা<br/>ফোনঃ +৮৮০ ১৭১২-৩৪৫৬৭৮</div>',
        'patient.name': 'John Doe',
        'patient.age': '35',
        'patient.gender': 'Male',
        'patient.phone': '+880 1798-765432',
        'date': new Date().toLocaleDateString(),
      };
      
      return dummyDataMap[element.dataField] || element.content || '';
    }
    
    // Otherwise, replace placeholders in content
    let content = element.content;
    
    // Replace doctor placeholders
    content = content
      .replace(/\{\{doctor\.name\}\}/g, 'Dr. Sarah Johnson')
      .replace(/\{\{doctor\.degrees\}\}/g, 'MBBS, MD (Medicine)')
      .replace(/\{\{doctor\.bmdc\}\}/g, 'Reg: A-12345')
      .replace(/\{\{doctor\.email\}\}/g, 'dr.sarah@example.com');
    
    // Replace hospital placeholders
    content = content
      .replace(/\{\{hospital\.name\}\}/g, 'City General Hospital')
      .replace(/\{\{hospital\.address\}\}/g, '123 Medical Road, Dhaka')
      .replace(/\{\{hospital\.phone\}\}/g, '+880 1712-345678')
      .replace(/\{\{hospital\.email\}\}/g, 'info@cityhospital.com');
    
    // Replace patient placeholders
    content = content
      .replace(/\{\{patient\.name\}\}/g, 'John Doe')
      .replace(/\{\{patient\.age\}\}/g, '35')
      .replace(/\{\{patient\.gender\}\}/g, 'Male')
      .replace(/\{\{patient\.phone\}\}/g, '+880 1798-765432');
    
    // Replace date placeholder
    content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
    
    return content;
  };

  const getSelectedElement = () => {
    if (!selectedElementId) return null;
    return elements.find((el) => el.id === selectedElementId);
  };

  const handleStyleChange = (newStyle: any) => {
    if (!selectedElementId) return;
    
    setElements(
      elements.map((el) =>
        el.id === selectedElementId ? { ...el, style: newStyle } : el
      )
    );
  };

  const handleSave = async () => {
    if (!templateId) return;
    
    // Validate template name
    const nameValidation = validateTemplateName(templateName);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || 'Template name is required');
      alert('Please fix the errors before saving');
      return;
    }
    
    setSaving(true);
    try {
      // Generate HTML/CSS for PDF
      const { html, css } = generateTemplateHTML(elements, printLayout);
      
      const design = {
        elements,
        printLayout,
        canvasBg
      };

      await printTemplateAPI.update(templateId, {
        name: templateName,
        description: templateDescription,
        design,
        htmlContent: html,
        cssContent: css
      });
      
      alert('Template saved successfully!');
      setNameError('');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = (id: string) => {
    // When selecting from gallery inside editor, we switch to that template
    // This might mean reloading the editor with new ID, or just loading data
    // For now, let's reload data
    if (confirm('Switching templates will discard unsaved changes. Continue?')) {
       // Ideally we should tell parent to change the ID
       // But we can also just load the data here if we are in "design mode"
       // However, the parent holds the 'templateId' prop.
       // So we should probably close gallery and let parent know?
       // The prop onSelectTemplate in Gallery expects (id) => void.
       // But here we need to update the parent's state.
       // Since we don't have a callback to update parent's templateId, 
       // we might need to rely on the fact that this modal is usually opened with a specific ID.
       
       // Wait, if we are in "Browse" mode from Hospital Page, we want to SELECT the template for the hospital.
       // If we are in "Edit", they are here.
       
       // Let's assume if they select a template here, we load its design into current canvas (like applying a preset).
       loadTemplateData(id);
       setShowGallery(false);
    }
  };

  const loadTemplateData = async (id: string) => {
    try {
      const response = await printTemplateAPI.getById(id);
      const template = response.data;
      if (template.design) {
        setElements(template.design.elements.map((el: any) => ({ ...el, id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })));
        setPrintLayout({ ...defaultPrintLayout, ...template.design.printLayout });
        setCanvasBg(template.design.canvasBg || '#ffffff');
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  };

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await printTemplateAPI.getById(templateId!);
      const template = response.data;
      
      // Load template metadata
      setTemplateName(template.name || '');
      setTemplateDescription(template.description || '');
      
      if (template.design) {
        setElements(template.design.elements || []);
        setPrintLayout({ ...defaultPrintLayout, ...template.design.printLayout });
        setCanvasBg(template.design.canvasBg || '#ffffff');
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  // Initialize with some default elements if empty
  useEffect(() => {
    if (elements.length === 0 && !templateId) {
      // Add some defaults?
    }
  }, []);

  const handleClose = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm w-full flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div>
                   <h2 className="text-lg font-bold text-gray-900">
                     {templateId ? 'Edit Template' : 'Create Template'}
                   </h2>
                   <p className="text-xs text-gray-500">Drag and drop elements to design your prescription</p>
                </div>
              
              {/* Panel Toggle Buttons */}
              {!showPreview && (
                <div className="flex items-center gap-2 ml-4">
                  {!showToolbox && (
                    <button
                      onClick={() => setShowToolbox(true)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1.5"
                      title="Show Toolbox"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Toolbox
                    </button>
                  )}
                  {!showProperties && (
                    <button
                      onClick={() => setShowProperties(true)}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center gap-1.5"
                      title="Show Properties"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Properties
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
               <div className="bg-gray-200 p-1 rounded-lg flex text-xs font-medium">
                 <button 
                   onClick={() => setShowPreview(false)}
                   className={`px-3 py-1 rounded-md transition-all ${!showPreview ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                   Design
                 </button>
                 <button 
                   onClick={() => setShowPreview(true)}
                   className={`px-3 py-1 rounded-md transition-all ${showPreview ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                   Preview
                 </button>
               </div>
            </div>
          </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Toolbox */}
            {!showPreview && showToolbox && (
              <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300">
                 <div className="flex-1 overflow-y-auto">
                   <div className="p-4">
                     <div className="flex justify-between items-center mb-3">
                       <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Toolbox</h3>
                       <button
                         onClick={() => setShowToolbox(false)}
                         className="p-1 hover:bg-gray-100 rounded transition-colors"
                         title="Hide Toolbox"
                       >
                         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                     </div>
                     <ElementToolbox onAddElement={() => {}} />
                   </div>
                 </div>
              </div>
            )}

            {/* Canvas Area */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
               <div 
                 ref={showPreview ? undefined : setNodeRef}
                 id="main-canvas"
                 className="bg-white shadow-lg transition-all duration-300 relative"
                 style={{
                   width: printLayout.pageSize === 'A4' ? '210mm' : '148mm',
                   height: printLayout.pageSize === 'A4' ? '297mm' : '210mm',
                   backgroundColor: canvasBg,
                   transformOrigin: 'center center',
                 }}
                 onClick={() => setSelectedElementId(null)}
               >
                  {/* Grid/Guidelines */}
                  {printLayout.showBorders && (
                    <div className="absolute inset-0 border border-dashed border-gray-300 pointer-events-none" />
                  )}
                  
                  {/* Margins Indicator */}
                  <div 
                    className="absolute border border-dashed border-blue-100 pointer-events-none"
                    style={{
                      top: `${printLayout.margins.top}px`,
                      right: `${printLayout.margins.right}px`,
                      bottom: `${printLayout.margins.bottom}px`,
                      left: `${printLayout.margins.left}px`,
                    }}
                  />

                  {/* Render Elements */}
                  {elements.map((element) => {
                     if (showPreview) {
                        // Static Preview Rendering
                        return (
                          <div
                            key={element.id}
                            id={element.id}
                            style={{
                              position: 'absolute',
                              left: `${element.position.x}px`,
                              top: `${element.position.y}px`,
                              width: `${element.size.width}px`,
                              height: `${element.size.height}px`,
                              fontSize: `${element.style.fontSize}px`,
                              fontFamily: element.style.fontFamily,
                              color: element.style.color,
                              textAlign: element.style.align as any,
                              fontWeight: element.style.bold ? 'bold' : 'normal',
                              fontStyle: element.style.italic ? 'italic' : 'normal',
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              display: 'flex',
                              alignItems: element.type === 'image' || element.type === 'logo' ? 'center' : 'flex-start',
                              justifyContent: element.type === 'image' || element.type === 'logo' ? 'center' : 'flex-start',
                            }}
                          >
                            {element.type === 'logo' || element.type === 'image' ? (
                               <img src="/images/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : element.type === 'line-horizontal' ? (
                               <div style={{ width: '100%', height: `${element.style.fontSize || 2}px`, backgroundColor: element.style.color }} />
                            ) : element.type === 'line-vertical' ? (
                               <div style={{ height: '100%', width: `${element.style.fontSize || 2}px`, backgroundColor: element.style.color }} />
                            ) : element.dataField?.includes('rich_text') ? (
                               <div dangerouslySetInnerHTML={{ __html: getPreviewContent(element) }} />
                            ) : (
                               getPreviewContent(element)
                            )}
                          </div>
                        );
                     }
                     
                     return (
                       <DraggableElement
                         key={element.id}
                         {...element}
                         isSelected={selectedElementId === element.id}
                         onSelect={() => setSelectedElementId(element.id)}
                         onUpdate={(updates) => handleUpdateElement(element.id, updates)}
                         onDelete={() => handleDeleteElement(element.id)}
                       />
                     );
                   })}

                   {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm">Canvas is empty</p>
                        <p className="text-xs mt-1">Drag elements from the toolbox</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Right Sidebar - Properties */}
            {!showPreview && showProperties && (
              <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden transition-all duration-300">
                 <div className="flex-1 overflow-y-auto">
                   <div className="p-4">
                     <div className="flex justify-between items-center mb-3">
                       <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Properties</h3>
                       <button
                         onClick={() => setShowProperties(false)}
                         className="p-1 hover:bg-gray-100 rounded transition-colors"
                         title="Hide Properties"
                       >
                         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                     </div>
                     {selectedElementId ? (
                       <StylePanel 
                         selectedElement={getSelectedElement()} 
                         onStyleChange={handleStyleChange}
                       />
                     ) : (
                       <div className="text-center py-8 text-gray-400 text-sm">
                         Select an element to edit its style
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDragItem ? (
              <div className="bg-blue-100 border-2 border-blue-500 rounded-lg px-4 py-2 shadow-lg cursor-grabbing">
                <span className="text-sm font-medium text-blue-900">
                  {activeDragItem.dataField || activeDragItem.content || "Element"}
                </span>
              </div>
            ) : null}
          </DragOverlay>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 Tip: Drag elements anywhere on the canvas, use print layout settings on the left
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Template Gallery Modal */}
        {showGallery && (
          <TemplateGallery
            onSelectTemplate={handleSelectTemplate}
            onEditTemplate={(id) => {
               loadTemplateData(id);
               setShowGallery(false);
            }}
            onClose={() => setShowGallery(false)}
          />
        )}
      </div>
    </DndContext>
  );
}
