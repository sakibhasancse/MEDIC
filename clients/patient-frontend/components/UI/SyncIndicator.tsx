'use client';

import { Chip, Fade } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useSync } from '@/hooks/useSync';

export function SyncIndicator() {
  const { isOnline } = useSync();

  return (
    <Fade in={!isOnline}>
      <Chip
        icon={<CloudOffIcon />}
        label="Offline - Changes will sync later"
        color="warning"
        sx={{ 
          position: 'fixed', 
          top: 80, // Below header
          right: 16, 
          zIndex: 2000,
          boxShadow: 2
        }}
      />
    </Fade>
  );
}
