import { createTheme } from '@mui/material/styles';

// Material Design 3 theme for Template Editor
export const templateEditorTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: '#e0e0e0',
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '2.125rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      color: '#757575',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.12)',
    '0px 6px 12px rgba(0,0,0,0.14)',
    '0px 8px 16px rgba(0,0,0,0.16)',
    '0px 10px 20px rgba(0,0,0,0.18)',
    '0px 12px 24px rgba(0,0,0,0.20)',
    '0px 14px 28px rgba(0,0,0,0.22)',
    '0px 16px 32px rgba(0,0,0,0.24)',
    '0px 18px 36px rgba(0,0,0,0.26)',
    '0px 20px 40px rgba(0,0,0,0.28)',
    '0px 22px 44px rgba(0,0,0,0.30)',
    '0px 24px 48px rgba(0,0,0,0.32)',
    '0px 26px 52px rgba(0,0,0,0.34)',
    '0px 28px 56px rgba(0,0,0,0.36)',
    '0px 30px 60px rgba(0,0,0,0.38)',
    '0px 32px 64px rgba(0,0,0,0.40)',
    '0px 34px 68px rgba(0,0,0,0.42)',
    '0px 36px 72px rgba(0,0,0,0.44)',
    '0px 38px 76px rgba(0,0,0,0.46)',
    '0px 40px 80px rgba(0,0,0,0.48)',
    '0px 42px 84px rgba(0,0,0,0.50)',
    '0px 44px 88px rgba(0,0,0,0.52)',
    '0px 46px 92px rgba(0,0,0,0.54)',
    '0px 48px 96px rgba(0,0,0,0.56)',
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px rgba(0,0,0,0.12)',
        },
        elevation3: {
          boxShadow: '0px 6px 12px rgba(0,0,0,0.14)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&:before': {
            display: 'none',
          },
          boxShadow: 'none',
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 48,
          '&.Mui-expanded': {
            minHeight: 48,
          },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});
