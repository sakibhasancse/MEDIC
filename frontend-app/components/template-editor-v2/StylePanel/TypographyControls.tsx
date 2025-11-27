'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { Element as TemplateElement } from '@/types/templateV2';

interface TypographyControlsProps {
  element: TemplateElement;
}

const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica',
  'Tahoma',
];

const FONT_WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
];

export default function TypographyControls({ element }: TypographyControlsProps) {
  const { updateElement } = useTemplateEditorStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isLine = element.type.startsWith('line');

  const handleStyleUpdate = (updates: any) => {
    updateElement(element.id, {
      style: { ...element.style, ...updates },
    });
  };

  // Special controls for lines
  if (isLine) {
    return (
      <Box>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Line Properties
        </Typography>

        {/* Line Thickness */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Thickness: {element.style.fontSize || 2}px
          </Typography>
          <Slider
            value={element.style.fontSize || 2}
            onChange={(_, value) => handleStyleUpdate({ fontSize: value })}
            min={1}
            max={20}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        {/* Line Color */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Line Color
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowColorPicker(true)}
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
                bgcolor: element.style.color || '#000000',
                border: 1,
                borderColor: 'divider',
              }}
            />
            <Typography variant="body2">{element.style.color || '#000000'}</Typography>
          </Button>

          <Dialog open={showColorPicker} onClose={() => setShowColorPicker(false)}>
            <DialogContent>
              <HexColorPicker
                color={element.style.color || '#000000'}
                onChange={(color) => handleStyleUpdate({ color })}
              />
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Typography
      </Typography>

      {/* Font Family */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Font Family</InputLabel>
        <Select
          value={element.style.fontFamily || 'Inter'}
          label="Font Family"
          onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((font) => (
            <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
              {font}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Font Size */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Font Size: {element.style.fontSize || 14}px
        </Typography>
        <Slider
          value={element.style.fontSize || 14}
          onChange={(_, value) => handleStyleUpdate({ fontSize: value })}
          min={8}
          max={72}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      {/* Font Weight */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Font Weight</InputLabel>
        <Select
          value={element.style.fontWeight || 400}
          label="Font Weight"
          onChange={(e) => handleStyleUpdate({ fontWeight: e.target.value })}
        >
          {FONT_WEIGHTS.map((weight) => (
            <MenuItem key={weight.value} value={weight.value}>
              {weight.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Line Height */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Line Height: {element.style.lineHeight || 1.5}
        </Typography>
        <Slider
          value={element.style.lineHeight || 1.5}
          onChange={(_, value) => handleStyleUpdate({ lineHeight: value })}
          min={1}
          max={3}
          step={0.1}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      {/* Text Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Text Color
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setShowColorPicker(true)}
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
              bgcolor: element.style.color || '#000000',
              border: 1,
              borderColor: 'divider',
            }}
          />
          <Typography variant="body2">{element.style.color || '#000000'}</Typography>
        </Button>

        <Dialog open={showColorPicker} onClose={() => setShowColorPicker(false)}>
          <DialogContent>
            <HexColorPicker
              color={element.style.color || '#000000'}
              onChange={(color) => handleStyleUpdate({ color })}
            />
          </DialogContent>
        </Dialog>
      </Box>

      {/* Text Alignment */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Text Alignment
        </Typography>
        <ToggleButtonGroup
          value={element.style.align || 'left'}
          exclusive
          onChange={(_, value) => value && handleStyleUpdate({ align: value })}
          size="small"
          fullWidth
        >
          <ToggleButton value="left">
            <FormatAlignLeft />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenter />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRight />
          </ToggleButton>
          <ToggleButton value="justify">
            <FormatAlignJustify />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Text Style */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Text Style
        </Typography>
        <ToggleButtonGroup size="small" fullWidth>
          <ToggleButton
            value="bold"
            selected={element.style.bold || false}
            onChange={() => handleStyleUpdate({ bold: !element.style.bold })}
          >
            <FormatBold />
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={element.style.italic || false}
            onChange={() => handleStyleUpdate({ italic: !element.style.italic })}
          >
            <FormatItalic />
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={element.style.underline || false}
            onChange={() => handleStyleUpdate({ underline: !element.style.underline })}
          >
            <FormatUnderlined />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
