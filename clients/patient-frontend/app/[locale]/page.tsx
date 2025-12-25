'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function HomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <LocalHospitalIcon sx={{ fontSize: 80, mb: 3 }} />
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Patient Portal
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Healthcare Access Made Easy
          </Typography>
          <Typography variant="body1" sx={{ mb: 6, opacity: 0.8, maxWidth: 400, mx: 'auto' }}>
            Access your prescriptions, book appointments, and manage your health records all in one place.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: 'white',
                color: '#0891B2',
                '&:hover': {
                  backgroundColor: '#F9FAFB',
                },
                minWidth: 140,
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/register')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                minWidth: 140,
              }}
            >
              Register
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
