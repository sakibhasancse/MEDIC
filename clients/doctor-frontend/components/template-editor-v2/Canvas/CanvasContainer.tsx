'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import CanvasElement from './CanvasElement';
import GridOverlay from './GridOverlay';
import AlignmentGuides from './AlignmentGuides';

export default function CanvasContainer() {
  const {
    elements,
    printLayout,
    canvasBg,
    showPreview,
    showGrid,
    alignmentGuides,
    clearSelection,
  } = useTemplateEditorStore();

  const { setNodeRef } = useDroppable({
    id: 'main-canvas',
  });

  // Calculate canvas dimensions based on page size
  const canvasWidth = printLayout.pageSize === 'A4' 
    ? (printLayout.orientation === 'portrait' ? '210mm' : '297mm')
    : (printLayout.orientation === 'portrait' ? '148mm' : '210mm');
    
  const canvasHeight = printLayout.pageSize === 'A4'
    ? (printLayout.orientation === 'portrait' ? '297mm' : '210mm')
    : (printLayout.orientation === 'portrait' ? '210mm' : '148mm');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        p: 4,
      }}
    >
      <Paper
        ref={showPreview ? undefined : setNodeRef}
        id="main-canvas"
        elevation={3}
        onClick={() => !showPreview && clearSelection()}
        sx={{
          position: 'relative',
          width: canvasWidth,
          height: canvasHeight,
          bgcolor: canvasBg,
          overflow: 'hidden',
          cursor: showPreview ? 'default' : 'crosshair',
        }}
      >
        {/* Grid Overlay */}
        {!showPreview && showGrid && <GridOverlay />}

        {/* Alignment Guides */}
        {!showPreview && <AlignmentGuides guides={alignmentGuides} />}

        {/* Margin Indicators */}
        {!showPreview && printLayout.showBorders && (
          <Box
            sx={{
              position: 'absolute',
              top: `${printLayout.margins.top}px`,
              right: `${printLayout.margins.right}px`,
              bottom: `${printLayout.margins.bottom}px`,
              left: `${printLayout.margins.left}px`,
              border: '1px dashed',
              borderColor: 'primary.light',
              pointerEvents: 'none',
              opacity: 0.5,
            }}
          />
        )}

        {/* Render Elements */}
        {elements.map((element) => (
          <CanvasElement key={element.id} element={element} />
        ))}

        {/* Empty State */}
        {elements.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                🎨
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                Canvas is empty
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Drag elements from the toolbox to get started
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
