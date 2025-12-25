import { createTheme } from '@mui/material/styles';

// Patient-focused Material Design 3 theme
export const patientTheme = createTheme({
  palette: {
    primary: {
      main: '#0891B2', // Cyan 600 - Calm healthcare blue
      light: '#06B6D4', // Cyan 500
      dark: '#0E7490', // Cyan 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F59E0B', // Amber 500 - Warm accent
      light: '#FCD34D', // Amber 300
      dark: '#D97706', // Amber 600
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981', // Emerald 500
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber 500
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red 500
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: '#F9FAFB', // Gray 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827', // Gray 900
      secondary: '#6B7280', // Gray 500
    },
    divider: '#E5E7EB', // Gray 200
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans Bengali", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 16, // Larger base for readability
    h1: {
      fontWeight: 600,
      fontSize: '2rem', // 32px
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem', // 24px
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem', // 20px
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.125rem', // 18px
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem', // 16px
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem', // 14px
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.4,
      color: '#6B7280',
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.1)', // card
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 4px 12px rgba(0,0,0,0.15)', // cardHover
    '0 6px 16px rgba(0,0,0,0.16)',
    '0 8px 20px rgba(0,0,0,0.18)',
    '0 10px 24px rgba(0,0,0,0.20)',
    '0 12px 28px rgba(0,0,0,0.22)',
    '0 14px 32px rgba(0,0,0,0.24)',
    '0 16px 36px rgba(0,0,0,0.26)',
    '0 18px 40px rgba(0,0,0,0.28)',
    '0 20px 44px rgba(0,0,0,0.30)',
    '0 22px 48px rgba(0,0,0,0.32)',
    '0 24px 52px rgba(0,0,0,0.34)',
    '0 26px 56px rgba(0,0,0,0.36)',
    '0 28px 60px rgba(0,0,0,0.38)',
    '0 30px 64px rgba(0,0,0,0.40)',
    '0 32px 68px rgba(0,0,0,0.42)',
    '0 34px 72px rgba(0,0,0,0.44)',
    '0 36px 76px rgba(0,0,0,0.46)',
    '0 38px 80px rgba(0,0,0,0.48)',
    '0 40px 84px rgba(0,0,0,0.50)',
    '0 42px 88px rgba(0,0,0,0.52)',
    '0 44px 92px rgba(0,0,0,0.54)',
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '12px 24px',
          minHeight: 44, // Touch target
          fontSize: '1rem',
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            minHeight: 44,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 60,
          '&.Mui-selected': {
            color: '#0891B2',
          },
        },
      },
    },
  },
});
