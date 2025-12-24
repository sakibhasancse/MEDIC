'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import TemplateEditorV2 from '@/components/template-editor-v2/TemplateEditorV2';
import { printTemplateAPI } from '@/lib/api';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [validating, setValidating] = useState(true);
  const [templateExists, setTemplateExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateTemplate = async () => {
      if (!id) {
        setError('No template ID provided');
        setValidating(false);
        return;
      }

      // Validate ID format
      if (typeof id !== 'string' || id.length !== 24) {
        setError(`Invalid template ID format: "${id}" (must be 24 characters)`);
        setValidating(false);
        return;
      }

      // Check if template exists
      try {
        const response = await printTemplateAPI.getById(id);
        console.log('API Response:', response);
        
        if (response.data) {
          setTemplateExists(true);
          console.log('✅ Template found:', response.data.name || 'Unnamed');
        } else {
          setError('Template not found in database');
        }
      } catch (err: any) {
        console.error('Template validation error:', err);
        
        if (err.response) {
          // Server responded with error
          if (err.response.status === 404) {
            setError(`Template not found: ID "${id}" does not exist in the database`);
          } else {
            setError(`Server error (${err.response.status}): ${err.response.data?.message || err.message}`);
          }
        } else if (err.request) {
          // Request made but no response
          setError('Cannot connect to server. Please check if the backend is running.');
        } else {
          // Other errors
          setError(`Failed to load template: ${err.message}`);
        }
      } finally {
        setValidating(false);
      }
    };

    validateTemplate();
  }, [id]);

  if (!id) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">No template ID provided in URL</Alert>
      </Box>
    );
  }

  if (validating) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Validating template...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Template Error</Typography>
          <Typography variant="body2">{error}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" display="block">Template ID: {id}</Typography>
            <Typography variant="caption" display="block">ID Length: {id.length} characters</Typography>
          </Box>
        </Alert>
        <Button variant="contained" onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!templateExists) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Template validation failed</Alert>
      </Box>
    );
  }

  return (
    <TemplateEditorV2 
      templateId={id} 
      onBack={() => router.back()}
    />
  );
}
