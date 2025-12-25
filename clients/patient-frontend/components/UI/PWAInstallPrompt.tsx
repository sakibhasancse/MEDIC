'use client';

import { Box, Button, Paper, Typography, Fade, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import { usePWAInstallPrompt } from '@/hooks/usePWAInstallPrompt';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('common');

  useEffect(() => {
    if (isInstallable) {
      setIsVisible(true);
    }
  }, [isInstallable]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleInstall = async () => {
    await promptInstall();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Fade in={isVisible}>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 80, // Above bottom nav
          left: 16,
          right: 16,
          p: 2,
          zIndex: 2000,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" component="div" fontWeight={600}>
            Install App
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Add to home screen for better experience
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="inherit"
          size="small"
          onClick={handleInstall}
          startIcon={<GetAppIcon />}
          sx={{ color: 'primary.main', bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
        >
          Install
        </Button>
        <IconButton size="small" onClick={handleDismiss} sx={{ color: 'white', ml: -1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Fade>
  );
}
