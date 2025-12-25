'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { usePathname, useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');

  const getValue = () => {
    if (pathname === '/dashboard') return 0;
    if (pathname.startsWith('/prescriptions')) return 1;
    if (pathname.startsWith('/appointments')) return 2;
    if (pathname.startsWith('/messages')) return 3;
    if (pathname.startsWith('/history')) return 4;
    if (pathname.startsWith('/profile')) return 5;
    return 0;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' },
      }}
      elevation={3}
      className="no-print"
    >
      <BottomNavigation
        value={getValue()}
        onChange={(event, newValue) => {
          const routes = [
            '/dashboard',
            '/prescriptions',
            '/appointments',
            '/messages',
            '/history',
            '/profile',
          ];
          router.push(routes[newValue]);
        }}
        showLabels
        sx={{ 
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 50,
            padding: '6px 0'
          }
        }}
      >
        <BottomNavigationAction label={t('dashboard')} icon={<HomeIcon />} />
        <BottomNavigationAction label={t('prescriptions')} icon={<DescriptionIcon />} />
        <BottomNavigationAction label={t('appointments')} icon={<CalendarMonthIcon />} />
        <BottomNavigationAction label={t('messages')} icon={<ChatIcon />} />
        <BottomNavigationAction label={t('history')} icon={<HistoryIcon />} />
        <BottomNavigationAction label={t('profile')} icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

