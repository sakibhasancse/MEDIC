'use client';

import { Box, Container, Typography } from '@mui/material';
import { Timeline } from '@mui/lab';
import { MobileBottomNav } from '@/components/Layout/MobileBottomNav';
import { TimelineItem } from '@/components/History/TimelineItem';
import { TimelineFilter } from '@/components/History/TimelineFilter';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { historyAPI } from '@/lib/api';
import { CircularProgress } from '@mui/material';

export default function HistoryPage() {
  const t = useTranslations('common');
  const [filter, setFilter] = useState('all');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await historyAPI.getTimeline();
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch medical history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item: any) => 
    filter === 'all' ? true : item.type === filter
  );

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {t('history')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your medical timeline
          </Typography>
        </Box>

        <TimelineFilter selectedType={filter} onSelect={setFilter} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredHistory.length > 0 ? (
          <Timeline position="right">
            {filteredHistory.map((item: any, index: number) => (
              <TimelineItem 
                key={item.id} 
                item={item} 
                isLast={index === filteredHistory.length - 1} 
              />
            ))}
          </Timeline>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No medical history found matching your filter.</Typography>
          </Box>
        )}
      </Container>
      <MobileBottomNav />
    </Box>
  );
}
