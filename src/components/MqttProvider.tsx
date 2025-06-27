'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMqtt } from '@/hooks/useMqtt';

interface DeviceStatus {
  online?: boolean;
  temperaturaAtual?: number;
  error?: string;
  ultimaAtualizacao?: number;
  
}

interface MQTTContextType {
  isConnected: boolean;
  error: Error | null;
  deviceStatuses: Record<string, DeviceStatus>;
  publishCommand: (deviceId: string, command: Record<string, unknown>) => void;
}

const MQTTContext = createContext<MQTTContextType>({
  isConnected: false,
  error: null,
  deviceStatuses: {},
  publishCommand: () => {},
});

export const useMQTTContext = () => useContext(MQTTContext);

interface MQTTProviderProps {
  children: React.ReactNode;
}

export function MQTTProvider({ children }: MQTTProviderProps) {
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({});
  const { isConnected, error, publishCommand } = useMqtt({
    onConnect: () => {
      console.log('MQTT Conectado');
    },
    onDisconnect: () => {
      console.log('MQTT Desconectado');
    },
    onError: (error) => {
      console.error('Erro MQTT:', error);
    },
    subscriptions: [
      {
        topic: 'ac-control/+/+/status',
        callback: (message, topic) => {
          try {
            const status = JSON.parse(message);
            const [, type, id] = topic.split('/');
            const deviceKey = `${type}/${id}`;
            
            setDeviceStatuses(prev => ({
              ...prev,
              [deviceKey]: {
                ...prev[deviceKey],
                ...status,
                ultimaAtualizacao: Date.now()
              }
            }));
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
          }
        }
      }
    ]
  });

  useEffect(() => {
    // Limpar status antigos (mais de 5 minutos sem atualização)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setDeviceStatuses(prev => {
        const newStatuses = { ...prev };
        Object.entries(newStatuses).forEach(([key, status]) => {
          if (status.ultimaAtualizacao && now - status.ultimaAtualizacao > 300000) {
            delete newStatuses[key];
          }
        });
        return newStatuses;
      });
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(cleanupInterval);
  }, []);

  const value = {
    isConnected,
    error,
    deviceStatuses,
    publishCommand,
  };

  return (
    <MQTTContext.Provider value={value}>
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50">
          Conectando ao broker MQTT...
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg z-50">
          Erro de conexão MQTT: {error.message}
        </div>
      )}
      {children}
    </MQTTContext.Provider>
  );
}