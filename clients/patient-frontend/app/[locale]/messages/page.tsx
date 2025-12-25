'use client';

import { Box, Container, Typography } from '@mui/material';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { MessageThreadList } from '@/components/Messages/MessageThreadList';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
  const t = useTranslations('messages');

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>

        <MessageThreadList />
      </Container>

      <MobileBottomNav />
    </Box>
  );
}
