'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { Rnd } from 'react-rnd';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { Element as TemplateElement } from '@/types/templateV2';
import { getPlaceholderContent, isHtmlContent } from '@/lib/placeholderData';

interface CanvasElementProps {
  element: TemplateElement;
}

export default function CanvasElement({ element }: CanvasElementProps) {
  const {
    selectedElementIds,
    selectElement,
    updateElement,
    showPreview,
    snapToGrid,
    gridSize,
  } = useTemplateEditorStore();

  const isSelected = selectedElementIds.includes(element.id);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id, e.ctrlKey || e.metaKey);
  };

  const handleDragStop = (e: any, d: any) => {
    updateElement(element.id, {
      position: { x: d.x, y: d.y },
    });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    updateElement(element.id, {
      size: {
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
      },
      position,
    });
  };

  // Render content based on element type
  const renderContent = () => {
    // Safety check
    if (!element || !element.style) {
      return <Box>Error: Invalid element</Box>;
    }

    const style = {
      fontSize: `${element.style.fontSize || 14}px`,
      fontFamily: element.style.fontFamily || 'Inter',
      fontWeight: element.style.fontWeight || 400,
      color: element.style.color || '#000000',
      textAlign: (element.style.align || 'left') as any,
      fontStyle: element.style.italic ? 'italic' : 'normal',
      textDecoration: element.style.underline ? 'underline' : 'none',
      lineHeight: element.style.lineHeight || 1.5,
      padding: element.style.padding 
        ? `${element.style.padding.top}px ${element.style.padding.right}px ${element.style.padding.bottom}px ${element.style.padding.left}px`
        : '0px',
      backgroundColor: element.style.backgroundColor || 'transparent',
      borderWidth: `${element.style.borderWidth || 0}px`,
      borderRadius: `${element.style.borderRadius || 0}px`,
      borderColor: element.style.borderColor || '#000000',
      borderStyle: element.style.borderStyle || 'solid',
      opacity: element.style.opacity !== undefined ? element.style.opacity : 1,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      overflow: 'auto',
    };

    // Lines
    if (element.type === 'line-horizontal') {
      return (
        <Box
          sx={{
            width: '100%',
            height: `${element.style.fontSize || 2}px`,
            bgcolor: element.style.color || '#000000',
          }}
        />
      );
    }

    if (element.type === 'line-vertical') {
      return (
        <Box
          sx={{
            width: `${element.style.fontSize || 2}px`,
            height: '100%',
            bgcolor: element.style.color || '#000000',
          }}
        />
      );
    }

    // Logo/Image
    if (element.type === 'logo' || element.type === 'image') {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            border: '2px dashed #ccc',
            borderRadius: 1,
            color: '#999',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          🖼️ {element.dataField ? `{{${element.dataField}}}` : 'Logo/Image'}
        </Box>
      );
    }

    // Box/Divider
    if (element.type === 'box' || element.type === 'divider') {
      return <Box sx={style} />;
    }

    // Text and Placeholder elements
    let displayContent = element.content || 'Text';
    
    // In design mode, show the placeholder variable
    if (element.dataField && !showPreview) {
      displayContent = `{{${element.dataField}}}`;
    }
    // In preview mode, show actual data
    else if (element.dataField && showPreview) {
      displayContent = getPlaceholderContent(element.dataField);
    }

    // Check if content is HTML (only in preview mode)
    if (showPreview && isHtmlContent(displayContent)) {
      return (
        <Box
          sx={style}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      );
    }

    // Plain text
    return (
      <Box sx={style}>
        {displayContent}
      </Box>
    );
  };

  if (showPreview) {
    // Static preview rendering
    return (
      <Box
        sx={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.style.zIndex,
        }}
      >
        {renderContent()}
      </Box>
    );
  }

  return (
    <Rnd
      position={{ x: element.position.x, y: element.position.y }}
      size={{ width: element.size.width, height: element.size.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onClick={handleSelect}
      bounds="parent"
      enableResizing={!element.locked}
      disableDragging={element.locked}
      dragGrid={snapToGrid ? [gridSize, gridSize] : undefined}
      resizeGrid={snapToGrid ? [gridSize, gridSize] : undefined}
      style={{
        zIndex: element.style.zIndex,
        border: isSelected ? '2px solid #1976d2' : 'none',
        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      {renderContent()}
    </Rnd>
  );
}
