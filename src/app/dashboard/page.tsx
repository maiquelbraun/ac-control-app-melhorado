'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid as MuiGrid,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { useWebSocket } from '@/services/websocket';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DevicesIcon from '@mui/icons-material/Devices';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SpeedIcon from '@mui/icons-material/Speed';

interface DashboardStats {
  totalSalas: number;
  totalClimatizadores: number;
  climatizadoresLigados: number;
  dispositivos: {
    total: number;
    online: number;
  };
  temperaturaMedia: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connect, subscribe, connected } = useWebSocket();

  // Carregar estatísticas iniciais
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/dashboard');
      const { success, data, message } = await response.json();

      if (success && data) {
        setStats(data);
      } else {
        setError(message || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      setError('Erro ao conectar ao servidor');
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Configurar WebSocket
  useEffect(() => {
    connect();

    // Inscrever-se para atualizações em tempo real
    const unsubscribe = subscribe('dashboard-updates', (data: DashboardStats) => {
      setStats(data);
    });

    return () => {
      unsubscribe();
    };
  }, [connect, subscribe]);

  // Carregar dados iniciais e configurar fallback para polling
  useEffect(() => {
    fetchStats();

    // Fallback para polling caso WebSocket não esteja conectado
    const interval = !connected ? setInterval(fetchStats, 60000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchStats, connected]);

  const handleRetry = () => {
    setLoading(true);
    fetchStats();
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <Typography variant="h6" className="text-gray-500 mb-4">
          {error}
        </Typography>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box className="text-center py-16">
        <Typography variant="h6" className="text-gray-500">
          Nenhum dado disponível
        </Typography>
      </Box>
    );
  }

  const StatCard = ({ icon, title, value, color }: StatCardProps) => (
    <Paper elevation={2} className="p-6 h-full transform transition-all hover:scale-105">
      <Box className="flex items-center justify-between mb-4">
        <IconButton className={`bg-${color}-100 text-${color}-600`}>
          {icon}
        </IconButton>
        <Typography variant="h4" className={`font-bold text-${color}-600`}>
          {value}
        </Typography>
      </Box>
      <Typography variant="subtitle1" className="text-gray-600">
        {title}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" className="py-8 animate-fadeIn">
      <Typography variant="h4" className="font-bold text-gray-800 mb-8">
        Dashboard
      </Typography>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div>
          <StatCard
            icon={<MeetingRoomIcon />}
            title="Total de Salas"
            value={stats.totalSalas}
            color="blue"
          />
        </div>
        <div>
          <StatCard
            icon={<AcUnitIcon />}
            title="Climatizadores"
            value={stats.totalClimatizadores}
            color="green"
          />
        </div>
        <div>
          <StatCard
            icon={<PowerSettingsNewIcon />}
            title="Climatizadores Ligados"
            value={stats.climatizadoresLigados}
            color="orange"
          />
        </div>
        <div>
          <StatCard
            icon={<DevicesIcon />}
            title="Dispositivos Online"
            value={`${stats.dispositivos.online}/${stats.dispositivos.total}`}
            color="purple"
          />
        </div>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full shadow-lg">
          <CardContent>
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              Status do Sistema
            </Typography>
            <Box className="space-y-4">
              <Box className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Box className="flex items-center">
                  <ThermostatIcon className="text-blue-600 mr-2" />
                  <Typography>Temperatura Média</Typography>
                </Box>
                <Typography variant="h6" className="font-bold text-blue-600">
                  {stats.temperaturaMedia}°C
                </Typography>
              </Box>
              <Box className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Box className="flex items-center">
                  <SpeedIcon className="text-green-600 mr-2" />
                  <Typography>Performance do Sistema</Typography>
                </Box>
                <Typography variant="h6" className="font-bold text-green-600">
                  {Math.round((stats.dispositivos.online / stats.dispositivos.total) * 100)}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card className="h-full shadow-lg">
          <CardContent>
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              Informações Adicionais
            </Typography>
            <Box className="space-y-4">
              <Typography variant="body1" className="text-gray-600">
                Sistema funcionando normalmente
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Última atualização: {new Date().toLocaleString()}{' '}
                {connected ? '(Tempo Real)' : '(Offline)'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}