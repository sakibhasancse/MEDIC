'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

interface DraggableElementProps {
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
  onUpdate: (updates: Partial<DraggableElementProps>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DraggableElement({
  id,
  type,
  content,
  dataField,
  position,
  size,
  style,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const transformStyle = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const handleDoubleClick = () => {
    if (type === 'text' || type === 'placeholder') {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent !== content) {
      onUpdate({ content: editContent });
    }
  };

  const elementStyle = {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    minHeight: `${size.height}px`,
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    color: style.color,
    textAlign: style.align,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    cursor: 'move',
    border: isSelected ? '2px solid #3b82f6' : (type.startsWith('line') ? 'none' : '1px dashed #cbd5e1'),
    padding: type.startsWith('line') ? '0' : '8px',
    backgroundColor: isSelected && !type.startsWith('line') ? '#eff6ff' : 'transparent',
    borderRadius: '4px',
    zIndex: isSelected ? 1000 : 10, // Ensure elements are visible above other content
    ...transformStyle,
  };

  // Render line elements
  if (type === 'line-horizontal') {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...elementStyle,
          height: `${style.fontSize || 2}px`,
          backgroundColor: style.color,
          border: isSelected ? '2px dashed #3b82f6' : 'none',
          minHeight: 'auto',
        }}
        {...listeners}
        {...attributes}
        onClick={onSelect}
        className="group"
      >
        {isSelected && (
          <div className="absolute -top-8 right-0 flex gap-1 bg-white border border-gray-300 rounded shadow-lg p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'line-vertical') {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...elementStyle,
          width: `${style.fontSize || 2}px`,
          height: `${size.height}px`,
          backgroundColor: style.color,
          border: isSelected ? '2px dashed #3b82f6' : 'none',
        }}
        {...listeners}
        {...attributes}
        onClick={onSelect}
        className="group"
      >
        {isSelected && (
          <div className="absolute -top-8 left-0 flex gap-1 bg-white border border-gray-300 rounded shadow-lg p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render logo/image elements
  if (type === 'logo' || type === 'image') {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...elementStyle,
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        {...listeners}
        {...attributes}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="group"
      >
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        
        {isSelected && (
          <div className="absolute -top-8 right-0 flex gap-1 bg-white border border-gray-300 rounded shadow-lg p-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
        
        {/* Resize handles */}
        {isSelected && (
          <>
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
              style={{ borderRadius: '0 0 4px 0' }}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={elementStyle}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={handleDoubleClick}
      className="group"
    >
      {isEditing ? (
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className="w-full bg-transparent border-none outline-none"
          style={{
            fontSize: `${style.fontSize}px`,
            fontFamily: style.fontFamily,
            color: style.color,
            textAlign: style.align,
          }}
        />
      ) : (
        dataField?.includes('rich_text') ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div>{content}</div>
        )
      )}

      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1 bg-white border border-gray-300 rounded shadow-lg p-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Resize handles */}
      {isSelected && (
        <>
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
            style={{ borderRadius: '0 0 4px 0' }}
          />
        </>
      )}
    </div>
  );
}
