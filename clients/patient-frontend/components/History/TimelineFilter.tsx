'use client';

import { Box, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';

interface TimelineFilterProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

export function TimelineFilter({ selectedType, onSelect }: TimelineFilterProps) {
  const t = useTranslations('prescriptions'); // reusing keys for simplicity or common
  // Actually better to use explicit keys or fallback
  
  const types = [
    { value: 'all', label: 'All' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'lab', label: 'Lab Reports' },
    { value: 'diagnosis', label: 'Diagnoses' }
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, '::-webkit-scrollbar': { display: 'none' } }}>
      {types.map((type) => (
        <Chip
          key={type.value}
          label={type.label}
          onClick={() => onSelect(type.value)}
          color={selectedType === type.value ? 'primary' : 'default'}
          variant={selectedType === type.value ? 'filled' : 'outlined'}
          clickable
        />
      ))}
    </Box>
  );
}
