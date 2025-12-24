'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ViewInAr as ViewInArIcon,
  Edit as EditIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { DndContext, DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter, DragOverlay } from '@dnd-kit/core';
import { templateEditorTheme } from '@/theme/muiTheme';
import { useTemplateEditorStore } from '@/store/templateEditorStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutosave } from '@/hooks/useAutosave';
import { useResizablePanels } from '@/hooks/useResizablePanels';
import ToolboxPanel from './Toolbox/ToolboxPanel';
import CanvasContainer from './Canvas/CanvasContainer';
import StylePanelContainer from './StylePanel/StylePanelContainer';
import DragPreview from './Canvas/DragPreview';
import { printTemplateAPI } from '@/lib/api';
import { generateTemplateHTML } from '@/lib/htmlGenerator';
import { Element as TemplateElement } from '@/types/templateV2';

interface TemplateEditorV2Props {
  templateId: string;
  onBack?: () => void;
}

export default function TemplateEditorV2({ templateId, onBack }: TemplateEditorV2Props) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeDragItem, setActiveDragItem] = React.useState<any>(null);

  const {
    showToolbox,
    showProperties,
    showPreview,
    toggleToolbox,
    toggleProperties,
    togglePreview,
    loadTemplate,
    setTemplateId,
    templateName,
    templateDescription,
    setTemplateName,
    setTemplateDescription,
    elements,
    printLayout,
    canvasBg,
    addElement,
    moveElement,
    undo,
    redo,
    history,
    historyIndex,
  } = useTemplateEditorStore();

  const { leftPanelWidth, rightPanelWidth } = useResizablePanels();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Enable autosave
  useAutosave({
    templateId,
    elements,
    printLayout,
    canvasBg,
    templateName,
    templateDescription,
    interval: 30000, // 30 seconds
    enabled: true,
  });

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Load template on mount
  useEffect(() => {
    loadTemplateData();
  }, [templateId]);

  const loadTemplateData = async () => {
    try {
      setLoading(true);
      setTemplateId(templateId);
      const response = await printTemplateAPI.getById(templateId);
      const template = response.data;

      if (template.design) {
        loadTemplate(
          template.design.elements || [],
          template.design.printLayout || {},
          template.design.canvasBg || '#ffffff',
          template.name || '',
          template.description || ''
        );
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    if (active.id.toString().startsWith('toolbox-')) {
      setActiveDragItem(active.data.current);
    } else {
      const element = elements.find((el) => el.id === active.id);
      setActiveDragItem(element);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    // Handle dropping new elements from toolbox
    if (active.id.toString().startsWith('toolbox-')) {
      const data = active.data.current;
      const canvasRect = document.getElementById('main-canvas')?.getBoundingClientRect();

      if (canvasRect && data && active.rect.current.translated) {
        const { left, top } = active.rect.current.translated;
        const dropX = left - canvasRect.left;
        const dropY = top - canvasRect.top;

        handleAddElement(data.type, data.dataField, dropX, dropY);
      }
      setActiveDragItem(null);
      return;
    }

    // Handle dragging existing elements
    const elementId = active.id as string;
    moveElement(elementId, delta);
    setActiveDragItem(null);
  };

    const handleAddElement = (type: string, dataField?: string, x: number = 50, y: number = 50) => {
    const isHorizontalLine = type === 'line-horizontal';
    const isVerticalLine = type === 'line-vertical';
    const isLogo = type === 'logo' || type === 'image';
    const isBox = type === 'box';
    const isDivider = type === 'divider';

    let displayContent = 'New Element';
    if (dataField) {
      const parts = dataField.split('.');
      displayContent = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    } else if (isHorizontalLine || isVerticalLine || isBox || isDivider) {
      displayContent = '';
    } else if (isLogo) {
      displayContent = 'Logo';
    }

    const newElement: TemplateElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      content: displayContent,
      dataField,
      position: { x, y },
      size: {
        width: isHorizontalLine ? 600 : (isVerticalLine ? 2 : (isLogo ? 100 : (isBox || isDivider ? 200 : 200))),
        height: isHorizontalLine ? 2 : (isVerticalLine ? 400 : (isLogo ? 100 : (isBox || isDivider ? 100 : 40)))
      },
      rotation: 0,
      locked: false,
      visible: true,
      style: {
        fontSize: isHorizontalLine || isVerticalLine || isDivider ? 2 : 14,
        fontFamily: 'Inter',
        fontWeight: 400,
        color: '#000000',
        lineHeight: 1.5,
        align: 'left',
        bold: false,
        italic: false,
        underline: false,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        borderWidth: isBox ? 1 : (isDivider ? 0 : 0),
        borderRadius: 0,
        borderColor: '#000000',
        borderStyle: 'solid',
        backgroundColor: isBox ? 'transparent' : (isDivider ? '#000000' : 'transparent'),
        opacity: 1,
        zIndex: elements.length,
      },
    };

    addElement(newElement);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { html, css } = generateTemplateHTML(elements, printLayout);

      const design = {
        elements,
        printLayout,
        canvasBg,
      };

      await printTemplateAPI.update(templateId, {
        name: templateName,
        description: templateDescription,
        design,
        htmlContent: html,
        cssContent: css,
      });

      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={templateEditorTheme}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={templateEditorTheme}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
          {/* Top AppBar */}
          <AppBar position="static" elevation={1} color="default" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {templateName || 'Template Editor'}
              </Typography>

              {/* Mode Toggle */}
              <ToggleButtonGroup
                value={showPreview ? 'preview' : 'design'}
                exclusive
                onChange={(_, value) => {
                  if (value) togglePreview();
                }}
                size="small"
                sx={{ mr: 2 }}
              >
                <ToggleButton value="design">
                  <EditIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Design
                </ToggleButton>
                <ToggleButton value="preview">
                  <ViewInArIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Preview
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Undo/Redo */}
              <Tooltip title="Undo (Ctrl+Z)">
                <span>
                  <IconButton onClick={undo} disabled={historyIndex <= 0} size="small">
                    <UndoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Redo (Ctrl+Y)">
                <span>
                  <IconButton onClick={redo} disabled={historyIndex >= history.length - 1} size="small">
                    <RedoIcon />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Save Button */}
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ ml: 2, mr: 1 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>

              {/* Close Button */}
              <IconButton onClick={handleClose} edge="end">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Main Content Area */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Sidebar - Toolbox */}
            {!showPreview && showToolbox && (
              <Box sx={{ width: leftPanelWidth, flexShrink: 0 }}>
                <ToolboxPanel onClose={toggleToolbox} />
              </Box>
            )}

            {/* Show Toolbox Button */}
            {!showPreview && !showToolbox && (
              <Tooltip title="Show Toolbox">
                <IconButton
                  onClick={toggleToolbox}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: 80,
                    zIndex: 10,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Canvas Area */}
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
              <CanvasContainer />
            </Box>

            {/* Right Sidebar - Properties */}
            {!showPreview && showProperties && (
              <Box sx={{ width: rightPanelWidth, flexShrink: 0 }}>
                <StylePanelContainer onClose={toggleProperties} />
              </Box>
            )}

            {/* Show Properties Button */}
            {!showPreview && !showProperties && (
              <Tooltip title="Show Properties">
                <IconButton
                  onClick={toggleProperties}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: 80,
                    zIndex: 10,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDragItem ? (
              <DragPreview item={activeDragItem} />
            ) : null}
          </DragOverlay>
        </Box>
      </DndContext>
    </ThemeProvider>
  );
}
