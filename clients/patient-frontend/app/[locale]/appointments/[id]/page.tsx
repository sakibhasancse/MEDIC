'use client';

import { Box, Container, Typography, Button, Divider, IconButton, Grid, Avatar } from '@mui/material';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { Card } from '@/components/UI/Card';
import { StatusChip } from '@/components/UI/StatusChip';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import ChatIcon from '@mui/icons-material/Chat';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState, useEffect } from 'react';
import { appointmentAPI } from '@/lib/api';
import { CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

export default function AppointmentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentAPI.getById(params.id);
        setAppointment(response.data);
      } catch (error) {
        console.error('Failed to fetch appointment:', error);
        toast.error('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [params.id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    setIsCancelling(true);
    try {
      await appointmentAPI.cancel(params.id);
      setAppointment((prev: any) => ({ ...prev, status: 'cancelled' }));
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = () => {
    toast('Please contact the clinic directly to reschedule your appointment.', {
      icon: 'ℹ️',
    });
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !appointment ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Appointment not found
            </Typography>
            <Button onClick={() => router.back()} sx={{ mt: 2 }}>
              Go Back
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Appointment Details
                </Typography>
                <StatusChip status={appointment.status === 'scheduled' ? 'upcoming' : appointment.status} />
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Time & Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CalendarMonthIcon color="primary" />
                      <Typography variant="body1">
                        {new Date(appointment.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <AccessTimeIcon color="primary" />
                      <Typography variant="body1">{appointment.time}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {appointment.visitType === 'online' ? (
                        <>
                          <VideocamIcon color="success" />
                          <Typography variant="body1">Online Consultation</Typography>
                        </>
                      ) : (
                        <>
                          <LocationOnIcon color="primary" />
                          <Box>
                            <Typography variant="body1">{appointment.clinicId?.name || 'Clinic'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.clinicId?.address || 'Physical Address'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Doctor Profile
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                        {appointment.doctorId?.name?.charAt(0) || 'D'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {appointment.doctorId?.name || 'Doctor'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.doctorId?.specialization || 'Medical Specialist'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      sx={{ mt: 3 }}
                      onClick={() => router.push(`/messages?doctor=${appointment.doctorId?._id}`)}
                    >
                      Message Doctor
                    </Button>
                  </Box>
                </Card>
              </Grid>

              <Grid size={12}>
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Instructions
                    </Typography>
                    <Typography variant="body1">
                      {appointment.notes || 'No special instructions provided for this appointment.'}
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={isCancelling ? <CircularProgress size={20} /> : <CancelIcon />}
                        disabled={appointment.status !== 'scheduled' || isCancelling}
                        onClick={handleCancel}
                      >
                        Cancel Appointment
                      </Button>
                      <Button 
                        variant="outlined" 
                        sx={{ flex: 1 }}
                        onClick={handleReschedule}
                      >
                        Reschedule
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
      <MobileBottomNav />
    </Box>
  );
}
