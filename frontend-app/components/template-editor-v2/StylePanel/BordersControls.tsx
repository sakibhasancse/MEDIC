'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  Button,
  Dialog,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { Element as TemplateElement } from '@/types/templateV2';

interface BordersControlsProps {
  element: TemplateElement;
}

export default function BordersControls({ element }: BordersControlsProps) {
  const { updateElement } = useTemplateEditorStore();
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const handleStyleUpdate = (updates: any) => {
    updateElement(element.id, {
      style: { ...element.style, ...updates },
    });
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Borders & Decoration
      </Typography>

      {/* Border Width */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Border Width: {element.style.borderWidth || 0}px
        </Typography>
        <Slider
          value={element.style.borderWidth || 0}
          onChange={(_, value) => handleStyleUpdate({ borderWidth: value })}
          min={0}
          max={10}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      {/* Border Style */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Border Style</InputLabel>
        <Select
          value={element.style.borderStyle || 'solid'}
          label="Border Style"
          onChange={(e) => handleStyleUpdate({ borderStyle: e.target.value })}
        >
          <MenuItem value="solid">Solid</MenuItem>
          <MenuItem value="dashed">Dashed</MenuItem>
          <MenuItem value="dotted">Dotted</MenuItem>
        </Select>
      </FormControl>

      {/* Border Radius */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Border Radius: {element.style.borderRadius || 0}px
        </Typography>
        <Slider
          value={element.style.borderRadius || 0}
          onChange={(_, value) => handleStyleUpdate({ borderRadius: value })}
          min={0}
          max={50}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      {/* Border Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Border Color
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setShowBorderColorPicker(true)}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: 1.5,
            textTransform: 'none',
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              bgcolor: element.style.borderColor || '#000000',
              border: 1,
              borderColor: 'divider',
            }}
          />
          <Typography variant="body2">{element.style.borderColor || '#000000'}</Typography>
        </Button>

        <Dialog open={showBorderColorPicker} onClose={() => setShowBorderColorPicker(false)}>
          <DialogContent>
            <HexColorPicker
              color={element.style.borderColor || '#000000'}
              onChange={(color) => handleStyleUpdate({ borderColor: color })}
            />
          </DialogContent>
        </Dialog>
      </Box>

      {/* Background Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Background Color
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setShowBgColorPicker(true)}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: 1.5,
            textTransform: 'none',
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              bgcolor: element.style.backgroundColor || 'transparent',
              border: 1,
              borderColor: 'divider',
            }}
          />
          <Typography variant="body2">{element.style.backgroundColor || 'transparent'}</Typography>
        </Button>

        <Dialog open={showBgColorPicker} onClose={() => setShowBgColorPicker(false)}>
          <DialogContent>
            <HexColorPicker
              color={element.style.backgroundColor || '#ffffff'}
              onChange={(color) => handleStyleUpdate({ backgroundColor: color })}
            />
          </DialogContent>
        </Dialog>
      </Box>

      {/* Opacity */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Opacity: {Math.round((element.style.opacity !== undefined ? element.style.opacity : 1) * 100)}%
        </Typography>
        <Slider
          value={element.style.opacity !== undefined ? element.style.opacity : 1}
          onChange={(_, value) => handleStyleUpdate({ opacity: value })}
          min={0}
          max={1}
          step={0.01}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
          size="small"
        />
      </Box>
    </Box>
  );
}
