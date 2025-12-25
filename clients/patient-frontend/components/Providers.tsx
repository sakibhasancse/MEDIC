'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { patientTheme } from '@/theme/patientTheme';
import { AuthProvider } from '@/context/AuthContext';
import { SyncIndicator } from '@/components/UI/SyncIndicator';
import { PWAInstallPrompt } from '@/components/UI/PWAInstallPrompt';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={patientTheme}>
        <CssBaseline />
        <AuthProvider>
          {children}
          <SyncIndicator />
          <PWAInstallPrompt />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
