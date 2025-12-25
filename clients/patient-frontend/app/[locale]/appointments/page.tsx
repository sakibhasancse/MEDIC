'use client';

import { Box, Container, Typography, Tabs, Tab, Grid, Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { Card } from '@/components/UI/Card';
import { StatusChip } from '@/components/UI/StatusChip';
import { useRouter } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import { appointmentAPI } from '@/lib/api';

export default function AppointmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentAPI.getAll();
        setAppointmentsData(response.data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcoming = appointmentsData.filter(a => a.status === 'scheduled');
  const past = appointmentsData.filter(a => a.status === 'completed');
  const cancelled = appointmentsData.filter(a => a.status === 'cancelled');

  const appointments = tab === 0 ? upcoming : tab === 1 ? past : cancelled;

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              My Appointments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your doctor appointments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/appointments/book')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Book New
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label={`Upcoming (${upcoming.length})`} />
            <Tab label={`Past (${past.length})`} />
            <Tab label={`Cancelled (${cancelled.length})`} />
          </Tabs>
        </Box>

        {/* Appointments List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : appointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarMonthIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No {tab === 0 ? 'upcoming' : tab === 1 ? 'past' : 'cancelled'} appointments
            </Typography>
            {tab === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/appointments/book')}
                sx={{ mt: 2 }}
              >
                Book Your First Appointment
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {appointments.map((appointment) => (
              <Grid size={12} key={appointment._id}>
                <Card interactive onClick={() => router.push(`/appointments/${appointment._id}`)}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {appointment.doctorId?.name || 'Doctor'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {appointment.clinicId?.name || 'Clinic'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarMonthIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {appointment.visitType === 'online' ? (
                              <VideocamIcon fontSize="small" color="success" />
                            ) : (
                              <LocationOnIcon fontSize="small" color="primary" />
                            )}
                            <Typography variant="body2">
                              {appointment.visitType === 'online' ? 'Online' : 'Physical'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <StatusChip status="synced" />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Mobile FAB */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            display: { xs: 'block', sm: 'none' },
          }}
        >
          <Button
            variant="contained"
            sx={{
              borderRadius: '50%',
              width: 56,
              height: 56,
              minWidth: 56,
              boxShadow: 4,
            }}
            onClick={() => router.push('/appointments/book')}
          >
            <AddIcon />
          </Button>
        </Box>
      </Container>

      <MobileBottomNav />
    </Box>
  );
}
