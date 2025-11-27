'use client';

import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import DraggableElement from './DraggableElement';

interface Element {
  id: string;
  type: 'text' | 'image' | 'logo' | 'placeholder' | 'line-horizontal' | 'line-vertical';
  content: string;
  dataField?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    align: 'left' | 'center' | 'right';
    bold: boolean;
    italic: boolean;
  };
}

interface FooterEditorProps {
  elements: Element[];
  onElementsChange: (elements: Element[]) => void;
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
  height: number;
  onHeightChange: (height: number) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export default function FooterEditor({
  elements,
  onElementsChange,
  backgroundColor,
  onBackgroundChange,
  height,
  onHeightChange,
  selectedElementId,
  onSelectElement,
}: FooterEditorProps) {
  const { setNodeRef } = useDroppable({ id: 'footer-canvas' });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as string;
    
    const updatedElements = elements.map((el) => {
      if (el.id === elementId) {
        return {
          ...el,
          position: {
            x: el.position.x + delta.x,
            y: el.position.y + delta.y,
          },
        };
      }
      return el;
    });
    
    onElementsChange(updatedElements);
  };

  const handleUpdateElement = (id: string, updates: Partial<Element>) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(updatedElements);
  };

  const handleDeleteElement = (id: string) => {
    onElementsChange(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      onSelectElement(null);
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
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-700">Height:</label>
          <input
            type="range"
            min="50"
            max="200"
            value={height}
            onChange={(e) => onHeightChange(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-xs text-gray-600">{height}px</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <DndContext onDragEnd={handleDragEnd}>
          <div
            ref={setNodeRef}
            className="relative bg-white shadow-lg mx-auto"
            style={{
              width: '210mm',
              height: `${height}px`,
              backgroundColor,
            }}
            onClick={() => onSelectElement(null)}
          >
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-sm">Add footer elements (hospital info, next visit, show time)</p>
                </div>
              </div>
            )}
            
            {elements.map((element) => (
              <DraggableElement
                key={element.id}
                {...element}
                onUpdate={(updates) => handleUpdateElement(element.id, updates)}
                onDelete={() => handleDeleteElement(element.id)}
                isSelected={selectedElementId === element.id}
                onSelect={() => onSelectElement(element.id)}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
