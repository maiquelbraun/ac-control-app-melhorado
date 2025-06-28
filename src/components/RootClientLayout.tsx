'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/app/theme';
import Navbar from './Navbar';
import { MQTTProvider } from './MqttProvider';

interface RootClientLayoutProps {
  children: React.ReactNode;
}

export default function RootClientLayout({ children }: RootClientLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* <MQTTProvider> */}
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow bg-gray-50">
            {children}
          </main>
          <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} AC Control. Todos os direitos reservados.
          </footer>
        </div>
      {/* </MQTTProvider> */}
    </ThemeProvider>
  );
}