'use client';

import { Box, Container, Typography, TextField, InputAdornment, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { Card } from '@/components/UI/Card';
import { StatusChip } from '@/components/UI/StatusChip';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description';

import { useState, useEffect } from 'react';
import { prescriptionAPI } from '@/lib/api';
import { CircularProgress } from '@mui/material';

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await prescriptionAPI.getAll();
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            My Prescriptions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your prescription history
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search prescriptions..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Prescriptions List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : prescriptions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No prescriptions found.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {prescriptions.map((prescription) => (
              <Grid size={12} key={prescription._id}>
                <Card
                  interactive
                  onClick={() => router.push(`/prescriptions/${prescription._id}`)}
                >
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <DescriptionIcon />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {prescription.diagnosis || 'Prescription'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {prescription.doctorId?.name || 'Doctor'} • {prescription.hospitalId?.name || 'Clinic'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(prescription.createdAt).toLocaleDateString()} • {prescription.medicines?.length || 0} medicine{(prescription.medicines?.length || 0) > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <StatusChip status="synced" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      RX-{prescription._id.slice(-8).toUpperCase()}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <MobileBottomNav />
    </Box>
  );
}
