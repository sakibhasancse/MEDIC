'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Element as TemplateElement } from '@/types/templateV2';

interface DragPreviewProps {
  item: any; // Can be ToolboxElement or TemplateElement
}

export default function DragPreview({ item }: DragPreviewProps) {
  // Handle toolbox items (new elements being dragged from toolbox)
  if (item.type && !item.id) {
    const type = item.type;
    
    // Horizontal Line
    if (type === 'line-horizontal') {
      return (
        <Box
          sx={{
            width: '100px',
            height: '2px',
            bgcolor: '#000000',
            boxShadow: 3,
          }}
        />
      );
    }
    
    // Vertical Line
    if (type === 'line-vertical') {
      return (
        <Box
          sx={{
            width: '2px',
            height: '60px',
            bgcolor: '#000000',
            boxShadow: 3,
          }}
        />
      );
    }
    
    // Box/Rectangle
    if (type === 'box') {
      return (
        <Box
          sx={{
            width: '80px',
            height: '50px',
            border: '1px solid #000000',
            bgcolor: 'transparent',
            boxShadow: 3,
          }}
        />
      );
    }
    
    // Divider
    if (type === 'divider') {
      return (
        <Box
          sx={{
            width: '100px',
            height: '20px',
            bgcolor: '#000000',
            boxShadow: 3,
          }}
        />
      );
    }
    
    // Logo/Image
    if (type === 'logo' || type === 'image') {
      return (
        <Box
          sx={{
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            border: '2px dashed #ccc',
            borderRadius: 1,
            color: '#999',
            fontSize: '24px',
            boxShadow: 3,
          }}
        >
          🖼️
        </Box>
      );
    }
    
    // Text/Placeholder elements - show the dataField or a generic label
    const displayText = item.dataField 
      ? item.dataField.split('.').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
      : (type === 'text' ? 'Text' : 'Element');
    
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1,
          boxShadow: 3,
          fontWeight: 500,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
        }}
      >
        {displayText}
      </Box>
    );
  }
  
  // Handle existing elements being dragged on canvas
  const element = item as TemplateElement;
  
  if (!element || !element.style) {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1,
          boxShadow: 3,
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        Element
      </Box>
    );
  }
  
  // Horizontal Line
  if (element.type === 'line-horizontal') {
    return (
      <Box
        sx={{
          width: `${Math.min(element.size.width, 200)}px`,
          height: `${element.style.fontSize || 2}px`,
          bgcolor: element.style.color || '#000000',
          boxShadow: 3,
        }}
      />
    );
  }
  
  // Vertical Line
  if (element.type === 'line-vertical') {
    return (
      <Box
        sx={{
          width: `${element.style.fontSize || 2}px`,
          height: `${Math.min(element.size.height, 100)}px`,
          bgcolor: element.style.color || '#000000',
          boxShadow: 3,
        }}
      />
    );
  }
  
  // Box
  if (element.type === 'box') {
    return (
      <Box
        sx={{
          width: `${Math.min(element.size.width, 120)}px`,
          height: `${Math.min(element.size.height, 80)}px`,
          borderWidth: `${element.style.borderWidth || 1}px`,
          borderStyle: element.style.borderStyle || 'solid',
          borderColor: element.style.borderColor || '#000000',
          borderRadius: `${element.style.borderRadius || 0}px`,
          bgcolor: element.style.backgroundColor || 'transparent',
          boxShadow: 3,
        }}
      />
    );
  }
  
  // Divider
  if (element.type === 'divider') {
    return (
      <Box
        sx={{
          width: `${Math.min(element.size.width, 150)}px`,
          height: `${Math.min(element.size.height, 40)}px`,
          bgcolor: element.style.backgroundColor || '#000000',
          boxShadow: 3,
        }}
      />
    );
  }
  
  // Logo/Image
  if (element.type === 'logo' || element.type === 'image') {
    return (
      <Box
        sx={{
          width: `${Math.min(element.size.width, 80)}px`,
          height: `${Math.min(element.size.height, 80)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          border: '2px dashed #ccc',
          borderRadius: 1,
          color: '#999',
          fontSize: '24px',
          boxShadow: 3,
        }}
      >
        🖼️
      </Box>
    );
  }
  
  // Text/Placeholder elements
  const displayContent = element.dataField 
    ? `{{${element.dataField}}}` 
    : element.content || 'Text';
  
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 1,
        boxShadow: 3,
        fontWeight: 500,
        fontSize: '0.875rem',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {displayContent}
    </Box>
  );
}
