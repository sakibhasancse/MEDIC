'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Visibility as PreviewIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { printTemplateAPI } from '@/lib/api';

interface Template {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateGalleryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate?: (templateId: string) => void;
  onEditTemplate?: (templateId: string) => void;
  onCreateNew?: () => void;
}

export default function TemplateGalleryModal({
  open,
  onClose,
  onSelectTemplate,
  onEditTemplate,
  onCreateNew,
}: TemplateGalleryModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const categories = ['all', 'classic', 'modern', 'minimal', 'custom'];

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await printTemplateAPI.getAll();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, templateId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTemplateId(templateId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplateId(null);
  };

  const handleEdit = () => {
    if (selectedTemplateId && onEditTemplate) {
      onEditTemplate(selectedTemplateId);
      handleMenuClose();
      onClose();
    }
  };

  const handleDuplicate = async () => {
    if (!selectedTemplateId) return;

    try {
      const template = templates.find(t => t._id === selectedTemplateId);
      if (!template) return;

      // Get the full template data
      const response = await printTemplateAPI.getById(selectedTemplateId);
      const fullTemplate = response.data;

      // Create a duplicate
      await printTemplateAPI.create({
        name: `${template.name} (Copy)`,
        description: template.description,
        design: fullTemplate.design,
        htmlContent: fullTemplate.htmlContent,
        cssContent: fullTemplate.cssContent,
      });

      // Reload templates
      await loadTemplates();
      handleMenuClose();
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template');
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplateId) return;

    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await printTemplateAPI.delete(selectedTemplateId);
        await loadTemplates();
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template');
      }
    }
  };

  const handleSelect = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
      onClose();
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '900px',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Template Gallery
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {onCreateNew && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  onCreateNew();
                  onClose();
                }}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Create New
              </Button>
            )}
          </Box>

          {/* Category Filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>

        {/* Templates Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Typography variant="h6" gutterBottom>
              No templates found
            </Typography>
            <Typography variant="body2">
              {searchQuery ? 'Try adjusting your search' : 'Create your first template to get started'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {filteredTemplates.map((template) => (
              <Card
                key={template._id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleSelect(template._id)}
              >
                {/* Thumbnail */}
                <CardMedia
                  sx={{
                    height: 200,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                      <Typography variant="h3">📄</Typography>
                      <Typography variant="caption">No Preview</Typography>
                    </Box>
                  )}
                </CardMedia>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {template.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 40,
                    }}
                  >
                    {template.description || 'No description'}
                  </Typography>
                  {template.category && (
                    <Chip
                      label={template.category}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </Typography>
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, template._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <DuplicateIcon sx={{ mr: 1, fontSize: 20 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </Dialog>
  );
}
