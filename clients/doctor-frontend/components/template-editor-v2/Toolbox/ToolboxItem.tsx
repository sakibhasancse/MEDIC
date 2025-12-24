'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Box,
  Paper,
  Typography,
  Tooltip,
} from '@mui/material';
import { DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { ToolboxElement } from '@/types/templateV2';
import { ICON_MAP } from '@/lib/toolboxConfig';

interface ToolboxItemProps {
  element: ToolboxElement;
}

export default function ToolboxItem({ element }: ToolboxItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolbox-${element.type}-${element.dataField || Math.random()}`,
    data: {
      type: element.type,
      dataField: element.dataField,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const IconComponent = ICON_MAP[element.icon];

  return (
    <Tooltip title={element.description || element.label} placement="right" arrow>
      <Paper
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        elevation={0}
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: isDragging ? 'grabbing' : 'grab',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'primary.50',
            borderColor: 'primary.main',
            transform: 'translateX(4px)',
            boxShadow: 1,
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        
        {IconComponent && (
          <IconComponent sx={{ fontSize: 20, color: 'primary.main' }} />
        )}
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            color="text.primary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {element.label}
          </Typography>
        </Box>
      </Paper>
    </Tooltip>
  );
}
