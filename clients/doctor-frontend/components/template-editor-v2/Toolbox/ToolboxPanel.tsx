'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ToolboxSection from './ToolboxSection';
import { TOOLBOX_CATEGORIES } from '@/lib/toolboxConfig';

interface ToolboxPanelProps {
  onClose: () => void;
}

export default function ToolboxPanel({ onClose }: ToolboxPanelProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 0,
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Element Toolbox
        </Typography>
        <Tooltip title="Hide Toolbox">
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          },
        }}
      >
        {TOOLBOX_CATEGORIES.map((category) => (
          <ToolboxSection key={category} category={category} />
        ))}
      </Box>

      {/* Footer Tip */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'primary.50',
        }}
      >
        <Typography variant="caption" color="primary.main" fontWeight={500}>
          💡 Tip: Drag elements onto the canvas to add them
        </Typography>
      </Box>
    </Paper>
  );
}
