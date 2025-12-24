'use client';

import React from 'react';
import { Box } from '@mui/material';
import { AlignmentGuide } from '@/types/templateV2';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
}

export default function AlignmentGuides({ guides }: AlignmentGuidesProps) {
  return (
    <>
      {guides.map((guide, index) => (
        <Box
          key={`guide-${index}`}
          sx={{
            position: 'absolute',
            bgcolor: 'error.main',
            pointerEvents: 'none',
            zIndex: 9999,
            ...(guide.type === 'vertical'
              ? {
                  left: `${guide.position}px`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                }
              : {
                  top: `${guide.position}px`,
                  left: 0,
                  right: 0,
                  height: '1px',
                }),
          }}
        />
      ))}
    </>
  );
}
