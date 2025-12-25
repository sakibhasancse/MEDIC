'use client';

import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { RecentPrescriptionsWidget } from '@/components/Dashboard/RecentPrescriptionsWidget';
import { UpcomingAppointmentsCard } from '@/components/Dashboard/UpcomingAppointmentsCard';
import { MedicineReminders } from '@/components/Dashboard/MedicineReminders';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { useAuth } from '@/context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Welcome back, {user?.name || 'Patient'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's your health overview
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Logout
          </Button>
        </Box>

        {/* Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Recent Prescriptions */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <RecentPrescriptionsWidget />
          </Grid>

          {/* Upcoming Appointments */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <UpcomingAppointmentsCard />
          </Grid>

          {/* Medicine Reminders */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <MedicineReminders />
          </Grid>

          {/* Quick Actions */}
          <Grid size={12}>
            <QuickActions />
          </Grid>
        </Grid>
      </Container>

      <MobileBottomNav />
    </Box>
  );
}
