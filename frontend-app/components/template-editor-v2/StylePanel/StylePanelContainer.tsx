'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import TypographyControls from './TypographyControls';
import LayoutControls from './LayoutControls';
import BordersControls from './BordersControls';

interface StylePanelContainerProps {
  onClose: () => void;
}

export default function StylePanelContainer({ onClose }: StylePanelContainerProps) {
  const { selectedElementIds, elements } = useTemplateEditorStore();

  const selectedElement = selectedElementIds.length === 1
    ? elements.find((el) => el.id === selectedElementIds[0])
    : null;

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 0,
        borderLeft: 1,
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
          Properties
        </Typography>
        <Tooltip title="Hide Properties">
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
          p: 2,
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
        {selectedElement ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TypographyControls element={selectedElement} />
            <LayoutControls element={selectedElement} />
            <BordersControls element={selectedElement} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              color: 'text.disabled',
            }}
          >
            <Typography variant="h4" sx={{ mb: 1 }}>
              🎨
            </Typography>
            <Typography variant="body2" textAlign="center">
              Select an element to customize its properties
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
