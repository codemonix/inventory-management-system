export type ThemeMode = 'light' | 'dark';

export const getDesignTokens = (mode: ThemeMode) => ({
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2563eb' : '#3b82f6',
    },
    secondary: {
      main: mode === 'light' ? '#4b5563' : '#9ca3af',
    },
    error: {
      main: mode === 'light' ? '#ef4444' : '#f87171',
    },
    warning: {
      main: mode === 'light' ? '#f59e0b' : '#fbbf24',
    },
    success: {
      main: mode === 'light' ? '#10b981' : '#34d399',
    },
    background: {
      default: mode === 'light' ? '#f3f4f6' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      header: mode === 'light' ? '#f1f5f9' : '#1e1e1e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          padding: '8px',
        },
      },
    },
  },
});

