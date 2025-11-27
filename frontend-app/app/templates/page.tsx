'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { printTemplateAPI } from '@/lib/api';

interface Template {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await printTemplateAPI.getAll();
      setTemplates(response.data || []);
    } catch (err: any) {
      setError(`Failed to load templates: ${err.message}`);
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      setCreating(true);
      const response = await printTemplateAPI.create({
        name: newTemplateName,
        description: newTemplateDescription,
        design: {
          elements: [],
          printLayout: {
            pageSize: 'A4',
            orientation: 'portrait',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            showBorders: false,
          },
          canvasBg: '#ffffff',
        },
        htmlContent: '',
        cssContent: '',
      });

      setCreateDialogOpen(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      
      // Navigate to the new template editor
      router.push(`/templates/${response.data._id}/edit`);
    } catch (err: any) {
      alert(`Failed to create template: ${err.message}`);
      console.error('Error creating template:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await printTemplateAPI.delete(id);
      loadTemplates();
    } catch (err: any) {
      alert(`Failed to delete template: ${err.message}`);
      console.error('Error deleting template:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Print Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create New Template
        </Button>
      </Box>

      {templates.length === 0 ? (
        <Alert severity="info">
          No templates found. Create your first template to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name || 'Untitled Template'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ID: {template._id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => router.push(`/templates/${template._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTemplate(template._id, template.name)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onClose={() => !creating && setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            disabled={creating}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={newTemplateDescription}
            onChange={(e) => setNewTemplateDescription(e.target.value)}
            disabled={creating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate} variant="contained" disabled={creating}>
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
