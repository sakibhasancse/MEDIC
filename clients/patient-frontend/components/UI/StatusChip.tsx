import { Chip, ChipProps } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorIcon from '@mui/icons-material/Error';

type SyncStatus = 'synced' | 'pending' | 'offline' | 'failed';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'icon' | 'color'> {
  status: SyncStatus;
}

const statusConfig = {
  synced: {
    label: 'Synced',
    icon: <CheckCircleIcon fontSize="small" />,
    sx: {
      backgroundColor: '#D1FAE5',
      color: '#065F46',
      '& .MuiChip-icon': { color: '#10B981' },
    },
  },
  pending: {
    label: 'Pending Sync',
    icon: <AccessTimeIcon fontSize="small" />,
    sx: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
      '& .MuiChip-icon': { color: '#F59E0B' },
    },
  },
  offline: {
    label: 'Saved Offline',
    icon: <CloudOffIcon fontSize="small" />,
    sx: {
      backgroundColor: '#F3F4F6',
      color: '#374151',
      '& .MuiChip-icon': { color: '#6B7280' },
    },
  },
  failed: {
    label: 'Sync Failed',
    icon: <ErrorIcon fontSize="small" />,
    sx: {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      '& .MuiChip-icon': { color: '#EF4444' },
    },
  },
};

export function StatusChip({ status, sx, ...props }: StatusChipProps) {
  const config = statusConfig[status];
  
  return (
    <Chip
      label={config.label}
      icon={config.icon}
      size="small"
      sx={{
        ...config.sx,
        ...sx,
      }}
      {...props}
    />
  );
}
