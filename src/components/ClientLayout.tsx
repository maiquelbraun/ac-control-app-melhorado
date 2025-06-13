'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createNotificationContext } from '@/components/NotificationAlert';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1d4ed8', // blue-700
      light: '#3b82f6', // blue-500
      dark: '#1e40af', // blue-800
    },
    secondary: {
      main: '#6b7280', // gray-500
      light: '#9ca3af', // gray-400
      dark: '#4b5563', // gray-600
    },
    background: {
      default: '#f3f4f6', // gray-100
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.75rem',
        },
      },
    },
  },
});

// Create notification context
const { NotificationProvider } = createNotificationContext();

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 pt-20">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-4">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>© {new Date().getFullYear()} AC Control. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default ClientLayout;