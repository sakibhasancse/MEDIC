// Material Design 3 Theme Configuration
export const theme = {
  colors: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#26A69A',
      light: '#4DB6AC',
      dark: '#00897B',
      contrast: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
      contrast: '#FFFFFF',
    },
    warning: {
      main: '#F57C00',
      light: '#FF9800',
      dark: '#E65100',
      contrast: '#FFFFFF',
    },
    success: {
      main: '#388E3C',
      light: '#4CAF50',
      dark: '#2E7D32',
      contrast: '#FFFFFF',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
      dark: '#01579B',
      contrast: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.60)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    // Display
    displayLarge: {
      fontSize: '57px',
      lineHeight: '64px',
      fontWeight: 400,
      letterSpacing: '-0.25px',
    },
    displayMedium: {
      fontSize: '45px',
      lineHeight: '52px',
      fontWeight: 400,
    },
    displaySmall: {
      fontSize: '36px',
      lineHeight: '44px',
      fontWeight: 400,
    },

    // Headline
    headlineLarge: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 600,
    },
    headlineMedium: {
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 600,
    },
    headlineSmall: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
    },

    // Title
    titleLarge: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: 600,
    },
    titleMedium: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 600,
      letterSpacing: '0.15px',
    },
    titleSmall: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 600,
      letterSpacing: '0.1px',
    },

    // Body
    bodyLarge: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    bodyMedium: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0.25px',
    },
    bodySmall: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0.4px',
    },

    // Label
    labelLarge: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    labelMedium: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    labelSmall: {
      fontSize: '11px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  elevation: {
    0: 'none',
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    2: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  transitions: {
    duration: {
      shortest: '150ms',
      shorter: '200ms',
      short: '250ms',
      standard: '300ms',
      complex: '375ms',
      enteringScreen: '225ms',
      leavingScreen: '195ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },

  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Theme = typeof theme;
