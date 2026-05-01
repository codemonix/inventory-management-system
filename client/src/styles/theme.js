import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  shape: {
    borderRadius: 8, // Unified 8px radius across the entire app
  },
  palette: {
    mode, // Tells MUI to globally invert text and background contrasts
    primary: {
      main: mode === 'light' ? '#2563eb' : '#3b82f6', // Tailwind blue-600 / blue-500
    },
    secondary: {
      main: mode === 'light' ? '#4b5563' : '#9ca3af', // Tailwind gray-600 / gray-400
    },
    error: {
      main: mode === 'light' ? '#ef4444' : '#f87171', // Tailwind red-500 / red-400
    },
    warning: {
      main: mode === 'light' ? '#f59e0b' : '#fbbf24', // Tailwind amber-500 / amber-400
    },
    success: {
      main: mode === 'light' ? '#10b981' : '#34d399', // Tailwind emerald-500 / emerald-400
    },
    background: {
      default: mode === 'light' ? '#f3f4f6' : '#121212', // Tailwind gray-100 / Deep Dark
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',   // White / Elevated Dark
      header: mode === 'light' ? '#f1f5f9' : '#1e1e1e',
    },
  },
  components: {
    // 1. Fix standard buttons (remove all-caps, add bold text, flat design)
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
    // 2. Fix the "Frankenstein" text inputs
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          // Sync input background with the paper background for dark mode readability
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e', 
        },
      },
    },
    // 3. Fix tiny mobile icon buttons (fat-finger safety)
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
    // 4. Standardize dialog/modal shapes
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