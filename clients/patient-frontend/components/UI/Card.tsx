import { Card as MuiCard, CardProps } from '@mui/material';
import { ReactNode } from 'react';

interface CustomCardProps extends CardProps {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, interactive = false, sx, ...props }: CustomCardProps) {
  return (
    <MuiCard
      sx={{
        cursor: interactive ? 'pointer' : 'default',
        '&:active': interactive ? {
          transform: 'scale(0.98)',
        } : {},
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
}
