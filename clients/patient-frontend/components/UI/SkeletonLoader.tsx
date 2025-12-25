'use client';

import { Box, Skeleton } from '@mui/material';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'text' | 'avatar';
  count?: number;
}

export function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <Box className="grid-cards">
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} className="card">
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'avatar') {
    return <Skeleton variant="circular" width={40} height={40} />;
  }

  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="text" sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}
