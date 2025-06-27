'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MQTTProvider, useMQTTContext } from '@/components/MqttProvider';

interface DeviceStatus {
  online?: boolean;
  temperaturaAtual?: number;
  error?: string;
  ultimaAtualizacao?: number;
}

interface DispositivoStatus {
  id: string;
  idEsp32: string;
  statusOperacional: string;
  ultimaAtualizacao: string | null;
  associado: boolean;
  climatizadorId: string | null;
  status?: DeviceStatus;
}

function DispositivosContent() {
  const [dispositivos, setDispositivos] = useState<DispositivoStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, deviceStatuses } = useMQTTContext();

  const fetchDispositivos = async () => {
    try {
      const response = await fetch('/api/dispositivos-controle/status');
      const { success, data, message } = await response.json();
      
      if (success) {
        // Combinar dados do banco com status MQTT
        const dispositivosComStatus = data.map((d: DispositivoStatus) => ({
          ...d,
          status: deviceStatuses[`dispositivos/${d.idEsp32}`],
        }));
        setDispositivos(dispositivosComStatus);
      } else {
        setError(message);
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
      setError('Erro ao carregar dispositivos');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar quando status MQTT mudar
  useEffect(() => {
    if (isConnected) {
      fetchDispositivos();
    }
  }, [isConnected, deviceStatuses, fetchDispositivos]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dispositivos.map((dispositivo) => (
        <Card key={dispositivo.id} className="w-full">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">ESP32: {dispositivo.idEsp32}</Typography>
              <Chip
                label={dispositivo.status?.online ? 'Online' : 'Offline'}
                color={dispositivo.status?.online ? 'success' : 'error'}
                size="small"
              />
            </div>

            <div className="space-y-2">
              <Typography variant="body2" color="textSecondary">
                Status: {dispositivo.statusOperacional}
              </Typography>
              
              {dispositivo.status?.temperaturaAtual && (
                <Typography variant="body2">
                  Temperatura: {dispositivo.status.temperaturaAtual}°C
                </Typography>
              )}

              <Typography variant="body2">
                Climatizador: {dispositivo.associado ? 'Associado' : 'Não associado'}
              </Typography>

              {dispositivo.status?.error && (
                <Typography variant="body2" color="error">
                  Erro: {dispositivo.status.error}
                </Typography>
              )}

              <Typography variant="caption" color="textSecondary">
                Última atualização: {
                  dispositivo.ultimaAtualizacao 
                    ? new Date(dispositivo.ultimaAtualizacao).toLocaleString()
                    : 'Nunca'
                }
              </Typography>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DispositivosPage() {
  return (
    <MQTTProvider>
      <div className="p-6">
        <Typography variant="h4" className="mb-6">
          Status dos Dispositivos
        </Typography>
        <DispositivosContent />
      </div>
    </MQTTProvider>
  );
}