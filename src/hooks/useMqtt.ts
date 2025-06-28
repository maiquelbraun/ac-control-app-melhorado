'use client';

import { useEffect, useCallback, useState } from 'react';
import mqttService from '@/services/mqtt';
import { logger } from '@/lib/logger';

interface MQTTSubscription {
  topic: string;
  callback: (message: string, topic: string) => void;
  regex?: RegExp;
}

interface MQTTHookOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  subscriptions?: MQTTSubscription[];
}

interface MQTTHookReturn {
  isConnected: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  publishCommand: (deviceId: string, command: Record<string, unknown>) => void;
}

export const useMqtt = (options: MQTTHookOptions = {}): MQTTHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    try {
      await mqttService.connect({
        host: process.env.NEXT_PUBLIC_MQTT_HOST || 'localhost',
        port: parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '1883'),
        username: process.env.NEXT_PUBLIC_MQTT_USERNAME || 'admin',
        password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || 'admin123',
        ssl: process.env.NEXT_PUBLIC_MQTT_SSL === 'true',
      });
    } catch (error) {
      logger.error('Erro ao conectar MQTT:', error);
      setError(error as Error);
      options.onError?.(error as Error);
    }
  }, [options]);

  useEffect(() => {
    // Handlers para eventos MQTT
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      options.onConnect?.();

      // Se há subscrições, registrá-las após a conexão
      options.subscriptions?.forEach(async (sub) => {
        // Pre-compile regex for topic matching
        sub.regex = new RegExp(sub.topic.replace(/\+/g, '[^/]+').replace(/#/g, '.*'));
        try {
          await mqttService.subscribe(sub.topic);
        } catch (error) {
          logger.error(`Erro ao subscrever no tópico ${sub.topic}:`, error);
        }
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      options.onDisconnect?.();
    };

    const handleError = (error: Error) => {
      setError(error);
      options.onError?.(error);
    };

    const handleMessage = (topic: string, message: string) => {
      options.subscriptions?.forEach(sub => {
        if (sub.regex?.test(topic)) { // Use pre-compiled regex
          sub.callback(message, topic);
        }
      });
    };

    // Registrar listeners
    mqttService.addListener('connected', handleConnect);
    mqttService.addListener('disconnected', handleDisconnect);
    mqttService.addListener('error', handleError);
    mqttService.addListener('message', handleMessage);

    // Conectar se ainda não estiver conectado
    if (!mqttService.isConnected()) {
      connect();
    } else {
      setIsConnected(true);
    }

    // Cleanup
    return () => {
      mqttService.removeListener('connected', handleConnect);
      mqttService.removeListener('disconnected', handleDisconnect);
      mqttService.removeListener('error', handleError);
      mqttService.removeListener('message', handleMessage);
      mqttService.disconnect();
    };
  }, [connect, options]);

  const publishCommand = useCallback((deviceId: string, command: Record<string, unknown>) => {
    try {
      mqttService.publishCommand(deviceId, command);
    } catch (error) {
      logger.error('Erro ao publicar comando:', error);
      setError(error as Error);
      options.onError?.(error as Error);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    mqttService.disconnect();
  }, []);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    publishCommand,
  };
};