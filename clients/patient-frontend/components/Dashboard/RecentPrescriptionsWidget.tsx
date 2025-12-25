'use client';

import { Box, Typography, Button, Divider } from '@mui/material';
import { Card } from '@/components/UI/Card';
import { StatusChip } from '@/components/UI/StatusChip';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { prescriptionAPI } from '@/lib/api';
import { CircularProgress, Link } from '@mui/material';

export function RecentPrescriptionsWidget() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await prescriptionAPI.getAll();
        setPrescriptions(response.data.slice(0, 3)); // Only show top 3
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Prescriptions
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : prescriptions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No prescriptions yet
            </Typography>
          </Box>
        ) : (
          <Box>
            {prescriptions.map((prescription, index) => (
              <Box key={prescription.id}>
                {index > 0 && <Divider sx={{ my: 1.5 }} />}
                <Box
                  onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(8, 145, 178, 0.04)',
                    },
                    borderRadius: 1,
                    p: 1,
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prescription.diagnosis || 'Prescription'}
                    </Typography>
                    <StatusChip status="synced" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    {prescription.doctorName || 'Dr. Sarah Rahman'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 'auto', p: 2, pt: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => router.push('/prescriptions')}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}
