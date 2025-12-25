'use client';

import { Box, Typography, Checkbox, FormControlLabel, Divider, CircularProgress } from '@mui/material';
import { Card } from '@/components/UI/Card';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useState, useEffect } from 'react';
import { prescriptionAPI } from '@/lib/api';

export function MedicineReminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await prescriptionAPI.getAll();
        const prescriptions = response.data;
        
        // Extract medicines from latest prescriptions (last 3 for example)
        const allMedicines: any[] = [];
        prescriptions.slice(0, 3).forEach((p: any) => {
          (p.medicines || []).forEach((m: any) => {
            allMedicines.push({
              ...m,
              prescriptionId: p._id,
              date: p.createdAt
            });
          });
        });

        // Group by time of day based on instructions
        const grouped = [
          {
            id: 'morning',
            time: 'Morning',
            icon: <WbSunnyIcon fontSize="small" />,
            medicines: allMedicines.filter(m => 
              m.instructions?.toLowerCase().includes('morning') || 
              m.instructions?.toLowerCase().includes('breakfast') ||
              m.instructions?.includes('১+০+০') || m.instructions?.includes('১+১+০')
            )
          },
          {
            id: 'afternoon',
            time: 'Afternoon',
            icon: <LightModeIcon fontSize="small" />,
            medicines: allMedicines.filter(m => 
              m.instructions?.toLowerCase().includes('afternoon') || 
              m.instructions?.toLowerCase().includes('lunch') ||
              m.instructions?.includes('০+১+০') || m.instructions?.includes('১+১+১')
            )
          },
          {
            id: 'evening',
            time: 'Evening/Night',
            icon: <NightsStayIcon fontSize="small" />,
            medicines: allMedicines.filter(m => 
              m.instructions?.toLowerCase().includes('evening') || 
              m.instructions?.toLowerCase().includes('night') || 
              m.instructions?.toLowerCase().includes('dinner') ||
              m.instructions?.includes('০+০+১') || m.instructions?.includes('১+১+১') || m.instructions?.includes('১+০+১')
            )
          }
        ].filter(g => g.medicines.length > 0);

        setReminders(grouped);
      } catch (error) {
        console.error('Failed to fetch medicine reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationsActiveIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Today's Medicines
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : reminders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No medicines scheduled for today
            </Typography>
          </Box>
        ) : (
          <Box>
            {reminders.map((reminder, index) => (
              <Box key={reminder.id}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {reminder.icon}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {reminder.time}
                    </Typography>
                  </Box>
                  {reminder.medicines.map((medicine: any, idx: number) => (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {medicine.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {medicine.dose} • {medicine.instructions}
                          </Typography>
                        </Box>
                      }
                      sx={{ display: 'flex', alignItems: 'flex-start', ml: 0, mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
}
