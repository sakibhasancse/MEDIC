'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Slider,
  Tooltip,
} from '@mui/material';
import {
  FlipToFront,
  FlipToBack,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { Element as TemplateElement } from '@/types/templateV2';

interface LayoutControlsProps {
  element: TemplateElement;
}

export default function LayoutControls({ element }: LayoutControlsProps) {
  const { updateElement, bringForward, sendBackward, bringToFront, sendToBack } = useTemplateEditorStore();

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    updateElement(element.id, {
      position: {
        ...element.position,
        [axis]: Math.max(0, numValue),
      },
    });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    updateElement(element.id, {
      size: {
        ...element.size,
        [dimension]: Math.max(1, numValue),
      },
    });
  };

  const handleRotationChange = (value: number | number[]) => {
    updateElement(element.id, {
      rotation: Array.isArray(value) ? value[0] : value,
    });
  };

  const toggleLock = () => {
    updateElement(element.id, {
      locked: !element.locked,
    });
  };

  const toggleVisibility = () => {
    updateElement(element.id, {
      visible: !element.visible,
    });
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        Layout
      </Typography>

      {/* Position */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Position
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="X"
            type="number"
            value={element.position.x}
            onChange={(e) => handlePositionChange('x', e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Y"
            type="number"
            value={element.position.y}
            onChange={(e) => handlePositionChange('y', e.target.value)}
            size="small"
            fullWidth
          />
        </Box>
      </Box>

      {/* Size */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Size
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Width"
            type="number"
            value={element.size.width}
            onChange={(e) => handleSizeChange('width', e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Height"
            type="number"
            value={element.size.height}
            onChange={(e) => handleSizeChange('height', e.target.value)}
            size="small"
            fullWidth
          />
        </Box>
      </Box>

      {/* Rotation */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Rotation: {element.rotation}°
        </Typography>
        <Slider
          value={element.rotation}
          onChange={(_, value) => handleRotationChange(value)}
          min={0}
          max={360}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      {/* Layer Controls */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Layer Order (Z-Index: {element.style.zIndex || 0})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Bring to Front">
            <IconButton onClick={() => bringToFront(element.id)} size="small">
              <FlipToFront />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bring Forward">
            <IconButton onClick={() => bringForward(element.id)} size="small">
              <FlipToFront fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Backward">
            <IconButton onClick={() => sendBackward(element.id)} size="small">
              <FlipToBack fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send to Back">
            <IconButton onClick={() => sendToBack(element.id)} size="small">
              <FlipToBack />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Lock & Visibility */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Element State
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={element.locked ? 'Unlock' : 'Lock'}>
            <IconButton onClick={toggleLock} size="small" color={element.locked ? 'primary' : 'default'}>
              {element.locked ? <Lock /> : <LockOpen />}
            </IconButton>
          </Tooltip>
          <Tooltip title={element.visible ? 'Hide' : 'Show'}>
            <IconButton onClick={toggleVisibility} size="small" color={element.visible ? 'primary' : 'default'}>
              {element.visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Padding */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Padding
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <TextField
            label="Top"
            type="number"
            value={element.style.padding?.top || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  padding: { ...element.style.padding, top: Math.max(0, value) },
                },
              });
            }}
            size="small"
          />
          <TextField
            label="Right"
            type="number"
            value={element.style.padding?.right || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  padding: { ...element.style.padding, right: Math.max(0, value) },
                },
              });
            }}
            size="small"
          />
          <TextField
            label="Bottom"
            type="number"
            value={element.style.padding?.bottom || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  padding: { ...element.style.padding, bottom: Math.max(0, value) },
                },
              });
            }}
            size="small"
          />
          <TextField
            label="Left"
            type="number"
            value={element.style.padding?.left || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  padding: { ...element.style.padding, left: Math.max(0, value) },
                },
              });
            }}
            size="small"
          />
        </Box>
      </Box>

      {/* Margin */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Margin
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <TextField
            label="Top"
            type="number"
            value={element.style.margin?.top || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  margin: { ...element.style.margin, top: value },
                },
              });
            }}
            size="small"
          />
          <TextField
            label="Right"
            type="number"
            value={element.style.margin?.right || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  margin: { ...element.style.margin, right: value },
                },
              });
            }}
            size="small"
          />
          <TextField
            label="Bottom"
            type="number"
            value={element.style.margin?.bottom || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  margin: { ...element.style.margin, bottom: value },
                },
              });
            }}
            size="small"
          />
          <TextField
            label="Left"
            type="number"
            value={element.style.margin?.left || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              updateElement(element.id, {
                style: {
                  ...element.style,
                  margin: { ...element.style.margin, left: value },
                },
              });
            }}
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );
}
