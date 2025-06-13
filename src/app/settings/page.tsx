'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  Slider,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface Settings {
  notificationsEnabled: boolean;
  temperatureRange: [number, number];
  maintenanceInterval: number;
  mqttBroker: string;
  mqttPort: string;
  mqttUsername: string;
  mqttPassword: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: true,
    temperatureRange: [16, 30],
    maintenanceInterval: 30,
    mqttBroker: 'mqtt://localhost',
    mqttPort: '1883',
    mqttUsername: '',
    mqttPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const { success, data, message } = await response.json();

        if (success && data) {
          setSettings({
            notificationsEnabled: data.notificationsEnabled,
            temperatureRange: [data.temperatureRangeMin, data.temperatureRangeMax],
            maintenanceInterval: data.maintenanceInterval,
            mqttBroker: data.mqttBroker,
            mqttPort: data.mqttPort,
            mqttUsername: data.mqttUsername,
            mqttPassword: data.mqttPassword,
          });
        } else {
          setError(message || 'Erro ao carregar configurações');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const { success, message } = await response.json();

      if (success) {
        setShowSuccess(true);
      } else {
        setError(message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8 animate-fadeIn">
      <Typography variant="h4" className="font-bold text-gray-800 mb-8">
        Configurações do Sistema
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="font-bold text-gray-800 mb-6">
              Configurações Gerais
            </Typography>

            <Box className="space-y-6">
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationsEnabled}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      notificationsEnabled: e.target.checked 
                    })}
                    color="primary"
                  />
                }
                label="Ativar Notificações"
              />

              <Box>
                <Typography variant="subtitle2" className="text-gray-600 mb-2">
                  Faixa de Temperatura (°C)
                </Typography>
                <Slider
                  value={settings.temperatureRange}
                  onChange={(_, newValue) => setSettings({
                    ...settings,
                    temperatureRange: newValue as [number, number]
                  })}
                  valueLabelDisplay="auto"
                  min={16}
                  max={30}
                  marks
                  className="text-blue-600"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" className="text-gray-600 mb-2">
                  Intervalo de Manutenção (dias)
                </Typography>
                <Slider
                  value={settings.maintenanceInterval}
                  onChange={(_, newValue) => setSettings({
                    ...settings,
                    maintenanceInterval: newValue as number
                  })}
                  valueLabelDisplay="auto"
                  min={15}
                  max={90}
                  step={15}
                  marks
                  className="text-blue-600"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="font-bold text-gray-800 mb-6">
              Configurações MQTT
            </Typography>

            <Box className="space-y-4">
              <TextField
                fullWidth
                label="Broker MQTT"
                value={settings.mqttBroker}
                onChange={(e) => setSettings({
                  ...settings,
                  mqttBroker: e.target.value
                })}
                className="bg-white"
              />

              <TextField
                fullWidth
                label="Porta"
                value={settings.mqttPort}
                onChange={(e) => setSettings({
                  ...settings,
                  mqttPort: e.target.value
                })}
                className="bg-white"
              />

              <TextField
                fullWidth
                label="Usuário"
                value={settings.mqttUsername}
                onChange={(e) => setSettings({
                  ...settings,
                  mqttUsername: e.target.value
                })}
                className="bg-white"
              />

              <TextField
                fullWidth
                type="password"
                label="Senha"
                value={settings.mqttPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  mqttPassword: e.target.value
                })}
                className="bg-white"
              />
            </Box>
          </CardContent>
        </Card>
      </div>

      <Box className="flex justify-end mt-6">
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowSuccess(false)}
          className="bg-green-50 text-green-800"
        >
          Configurações salvas com sucesso!
        </Alert>
      </Snackbar>
    </Container>
  );
}