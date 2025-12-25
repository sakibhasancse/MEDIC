'use client';

import { 
  TimelineItem as MuiTimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot, 
  TimelineOppositeContent 
} from '@mui/lab';
import { Paper, Typography, Box, Chip } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'; // Prescription
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'; // Visit
import BiotechIcon from '@mui/icons-material/Biotech'; // Lab
import AssignmentIcon from '@mui/icons-material/Assignment'; // Diagnosis
import { format } from 'date-fns';

interface HistoryItem {
  id: string;
  type: 'prescription' | 'appointment' | 'lab' | 'diagnosis';
  title: string;
  subtitle: string;
  date: string;
  data: any;
}

export function TimelineItem({ item, isLast }: { item: HistoryItem, isLast: boolean }) {
  const getIcon = () => {
    switch (item.type) {
      case 'prescription': return <MedicalServicesIcon />;
      case 'appointment': return <LocalHospitalIcon />;
      case 'lab': return <BiotechIcon />;
      case 'diagnosis': return <AssignmentIcon />;
      default: return <LocalHospitalIcon />;
    }
  };

  const getColor = () => {
    switch (item.type) {
      case 'prescription': return 'primary';
      case 'appointment': return 'secondary';
      case 'lab': return 'warning';
      case 'diagnosis': return 'error';
      default: return 'primary';
    }
  };

  return (
    <MuiTimelineItem>
      <TimelineOppositeContent
        sx={{ m: 'auto 0' }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        {format(new Date(item.date), 'MMM d, yyyy')}
        <br />
        {format(new Date(item.date), 'h:mm a')}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector />
        <TimelineDot color={getColor() as any}>
          {getIcon()}
        </TimelineDot>
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" component="span">
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.subtitle}
          </Typography>
          {item.type === 'prescription' && item.data.diagnosis && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Diagnosis: {item.data.diagnosis}
            </Typography>
          )}
        </Paper>
      </TimelineContent>
    </MuiTimelineItem>
  );
}
