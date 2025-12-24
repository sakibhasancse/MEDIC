'use client';

import { useState, useMemo, useEffect } from 'react';
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

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  hospitalData?: any;
  printLayout?: any;
  onPrintLayoutChange?: (layout: any) => void;
  initialShowGallery?: boolean;
}



export default function TemplateEditorModal({
  isOpen,
  onClose,
  templateId,
  hospitalData,
  printLayout: initialPrintLayout,
  onPrintLayoutChange,
  initialShowGallery = false,
}: TemplateEditorModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showGallery, setShowGallery] = useState(initialShowGallery);
  const [saving, setSaving] = useState(false);
  
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
  const [printLayout, setPrintLayout] = useState(() => {
    if (initialPrintLayout && initialPrintLayout.margins) {
      return initialPrintLayout;
    }
    return defaultPrintLayout;
  });
  
  // Selection state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Drag state for showing preview
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

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
        design,
        htmlContent: html,
        cssContent: css
      });
      
      alert('Template saved successfully!');
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
      if (template.design) {
        setElements(template.design.elements || []);
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

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
             <h2 className="text-lg font-bold text-gray-900">
               {templateId ? 'Edit Template' : 'Create Template'}
             </h2>
             <p className="text-xs text-gray-500">Drag and drop elements to design your prescription</p>
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

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {!showPreview && (
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
               <div className="p-4 border-b border-gray-100">
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Toolbox</h3>
                 <ElementToolbox onAddElement={() => {}} />
               </div>
               <div className="p-4">
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Properties</h3>
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
          )}

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 p-8 overflow-auto flex justify-center relative">
             <div 
               ref={setNodeRef}
               id="main-canvas"
               className="bg-white shadow-lg transition-all duration-300 relative"
               style={{
                 width: printLayout.pageSize === 'A4' ? '210mm' : '148mm',
                 height: printLayout.pageSize === 'A4' ? '297mm' : '210mm',
                 backgroundColor: canvasBg,
                 transform: 'scale(0.8)',
                 transformOrigin: 'top center',
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
                          ) : (
                             element.content
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
              onClick={onClose}
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
  );
}
