'use client';

import React from 'react';
import { Box } from '@mui/material';

export default function GridOverlay() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '10px 10px',
        zIndex: 0,
      }}
    />
  );
}
