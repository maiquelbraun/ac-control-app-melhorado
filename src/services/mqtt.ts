import mqtt, { IClientOptions, MqttClient, ISubscriptionGrant, Packet, ClientSubscribeCallback } from 'mqtt';
import { logger } from '@/lib/logger';
import { EventEmitter } from 'events';

type MQTTEvents = 'connected' | 'disconnected' | 'error' | 'message';

interface MQTTServiceOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  ssl?: boolean;
}

class MQTTService extends EventEmitter {
  private static instance: MQTTService;
  private client: MqttClient | null = null;
  private connectionPromise: Promise<void> | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  private constructor() {
    super();
  }

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  public isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  public async connect(options: MQTTServiceOptions = {}): Promise<void> {
    if (this.client?.connected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const protocol = options.ssl ? 'wss' : 'ws';
      const host = options.host || 'localhost';
      const port = options.port || 1883;
      const brokerUrl = `${protocol}://${host}:${port}`;

      const clientOptions: IClientOptions = {
        username: options.username,
        password: options.password,
        clientId: `web-client-${Math.random().toString(16).substring(2, 10)}`,
        keepalive: 30,
        reconnectPeriod: 0, // Desabilita reconexão automática
      };

      this.client = mqtt.connect(brokerUrl, clientOptions);

      this.client.on('connect', () => {
        logger.info('Conectado ao broker MQTT');
        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve();
      });

      this.client.on('error', (error: Error) => {
        logger.error('Erro na conexão MQTT:', error);
        this.emit('error', error);
        reject(error);
      });

      this.client.on('close', () => {
        logger.warn('Conexão MQTT fechada');
        this.emit('disconnected');
        this.handleDisconnect();
      });

      this.client.on('message', (topic: string, payload: Buffer) => {
        this.emit('message', topic, payload.toString());
      });
    });

    return this.connectionPromise;
  }

  private handleDisconnect() {
    this.client = null;
    this.connectionPromise = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    }
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.client) {
      this.client.end(true);
      this.client = null;
    }
    
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.emit('disconnected');
  }

  public async subscribe(topic: string): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('Cliente MQTT não está conectado');
    }
    return new Promise((resolve, reject) => {
      const callback: ClientSubscribeCallback = (err, granted) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };
      this.client!.subscribe(topic, callback);
    });
  }

  public async publish(topic: string, message: string | object): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('Cliente MQTT não está conectado');
    }
    
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    return new Promise((resolve, reject) => {
      this.client!.publish(topic, messageStr, { qos: 1 }, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  public async publishCommand(deviceId: string, command: Record<string, unknown>): Promise<void> {
    const topic = `comando/${deviceId}`;
    return this.publish(topic, command);
  }
}

export const mqttService = MQTTService.getInstance();

export const publishToMqtt = (topic: string, message: string): Promise<void> => {
  return mqttService.publish(topic, message);
};

export default mqttService;