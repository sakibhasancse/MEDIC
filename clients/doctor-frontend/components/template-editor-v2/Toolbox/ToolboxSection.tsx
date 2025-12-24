'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import ToolboxItem from './ToolboxItem';
import { getElementsByCategory, ICON_MAP } from '@/lib/toolboxConfig';

interface ToolboxSectionProps {
  category: 'Doctor' | 'Hospital' | 'Patient' | 'Prescription' | 'General' | 'Lines' | 'Shapes';
}

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  Doctor: '👨‍⚕️',
  Hospital: '🏥',
  Patient: '👤',
  Prescription: '💊',
  General: '📝',
  Lines: '➖',
  Shapes: '⬜',
};

export default function ToolboxSection({ category }: ToolboxSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const elements = getElementsByCategory(category);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      disableGutters
      elevation={0}
      sx={{
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 48,
          px: 2,
          bgcolor: expanded ? 'action.hover' : 'transparent',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '& .MuiAccordionSummary-content': {
            my: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
            {CATEGORY_ICONS[category]}
          </Typography>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            {category}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({elements.length})
          </Typography>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 1, pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {elements.map((element, index) => (
            <ToolboxItem key={`${element.type}-${element.dataField || index}`} element={element} />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
