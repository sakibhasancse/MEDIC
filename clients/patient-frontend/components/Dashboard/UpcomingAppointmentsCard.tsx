'use client';

import { Box, Typography, Button, Avatar, Chip } from '@mui/material';
import { Card } from '@/components/UI/Card';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

import { useState, useEffect } from 'react';
import { appointmentAPI } from '@/lib/api';
import { CircularProgress } from '@mui/material';

export function UpcomingAppointmentsCard() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentAPI.getAll();
        const upcoming = response.data.find((a: any) => a.status === 'scheduled');
        setAppointment(upcoming);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('upcomingAppointments')}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !appointment ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('noAppointments')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/appointments/book')}
            >
              {t('bookAppointment')}
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Doctor Info */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar
                alt={appointment.doctorId?.name || 'Doctor'}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.light',
                }}
              >
                {(appointment.doctorId?.name || 'D').charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {appointment.doctorId?.name || 'Dr. Sarah Rahman'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {appointment.clinicId?.name || 'City Medical Center'}
                </Typography>
              </Box>
            </Box>

            {/* Appointment Details */}
            <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarMonthIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {appointment.visitType === 'online' ? (
                  <>
                    <VideocamIcon fontSize="small" color="action" />
                    <Typography variant="body2">Online Consultation</Typography>
                  </>
                ) : (
                  <>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2">Physical Visit</Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Visit Type Badge */}
            <Chip
              label={appointment.visitType === 'online' ? 'Online Consultation' : 'Physical Visit'}
              size="small"
              color={appointment.visitType === 'online' ? 'success' : 'primary'}
              sx={{ mb: 2 }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => router.push(`/appointments/${appointment._id}/reschedule`)}
              >
                Reschedule
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                color="error"
                onClick={() => router.push(`/appointments/${appointment._id}/cancel`)}
              >
                {tCommon('cancel')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
}
