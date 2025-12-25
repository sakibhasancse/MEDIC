'use client';

import { Box, Typography, Button, Grid } from '@mui/material';
import { Card } from '@/components/UI/Card';
import { useRouter } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatIcon from '@mui/icons-material/Chat';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';

const quickActions = [
  {
    id: 'book-appointment',
    title: 'Book Appointment',
    description: 'Schedule a visit with your doctor',
    icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
    color: '#0891B2',
    route: '/appointments/book',
  },
  {
    id: 'message-doctor',
    title: 'Message Doctor',
    description: 'Ask questions about your health',
    icon: <ChatIcon sx={{ fontSize: 32 }} />,
    color: '#10B981',
    route: '/messages',
  },
  {
    id: 'upload-report',
    title: 'Upload Report',
    description: 'Share lab results with your doctor',
    icon: <UploadFileIcon sx={{ fontSize: 32 }} />,
    color: '#F59E0B',
    route: '/reports/upload',
  },
  {
    id: 'view-history',
    title: 'Medical History',
    description: 'View your complete health timeline',
    icon: <HistoryIcon sx={{ fontSize: 32 }} />,
    color: '#8B5CF6',
    route: '/history',
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={action.id}>
              <Button
                fullWidth
                onClick={() => router.push(action.route)}
                sx={{
                  height: '100%',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: `${action.color}08`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ color: action.color }}>
                  {action.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {action.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {action.description}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
}
