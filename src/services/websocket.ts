import { create } from 'zustand';
import { logger } from '@/lib/logger';
import { ConnectionError } from '@/lib/errors';
import { StateCreator } from 'zustand';

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  connecting: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  getConnectionStatus: () => { 
    connected: boolean; 
    connecting: boolean; 
    lastError: string | null;
    reconnectAttempts: number;
  };
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

type WebSocketStoreCreator = StateCreator<WebSocketStore>;

export const useWebSocket = create<WebSocketStore>((set, get): WebSocketStore => ({
  socket: null,
  connected: false,
  connecting: false,
  lastError: null,
  reconnectAttempts: 0,

  connect: () => {
    const store = get();
    if (store.socket || store.connecting) return;

    set({ connecting: true });
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const socket = new WebSocket(wsUrl);

    socket.addEventListener('open', () => {
      logger.info('WebSocket connected');
      set({ 
        connected: true, 
        connecting: false,
        lastError: null,
        reconnectAttempts: 0
      });
    });

    socket.addEventListener('close', (event) => {
      logger.warn('WebSocket connection closed:', event.code, event.reason);
      set({ connected: false, socket: null });

      // Attempt reconnection if not manually disconnected
      const store = get();
      if (store.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          set((state: WebSocketStore) => ({ 
            ...state,
            reconnectAttempts: state.reconnectAttempts + 1 
          }));
          store.connect();
        }, RECONNECT_INTERVAL);
      } else {
        set({ 
          lastError: 'Máximo de tentativas de reconexão atingido',
          connecting: false
        });
        throw new ConnectionError('Falha na conexão WebSocket após várias tentativas');
      }
    });

    socket.addEventListener('error', (error) => {
      logger.error('WebSocket error:', error);
      set({ 
        lastError: 'Erro na conexão WebSocket',
        connecting: false
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ 
        socket: null, 
        connected: false, 
        connecting: false,
        reconnectAttempts: 0
      });
    }
  },

  subscribe: (channel: string, callback: (data: any) => void) => {
    const { socket } = get();
    if (!socket) {
      logger.warn('Tentativa de inscrição sem conexão WebSocket ativa');
      return () => {};
    }

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.channel === channel) {
          callback(data.payload);
        }
      } catch (error) {
        logger.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    socket.addEventListener('message', handler);

    try {
      socket.send(JSON.stringify({ type: 'subscribe', channel }));
      logger.debug(`Inscrito no canal: ${channel}`);
    } catch (error) {
      logger.error('Erro ao enviar inscrição:', error);
    }

    return () => {
      socket.removeEventListener('message', handler);
      try {
        socket.send(JSON.stringify({ type: 'unsubscribe', channel }));
        logger.debug(`Cancelada inscrição no canal: ${channel}`);
      } catch (error) {
        logger.error('Erro ao cancelar inscrição:', error);
      }
    };
  },

  getConnectionStatus: () => {
    const { connected, connecting, lastError, reconnectAttempts } = get();
    return { connected, connecting, lastError, reconnectAttempts };
  }
}));

// Hook personalizado para status da conexão
export const useConnectionStatus = () => {
  return useWebSocket((state: WebSocketStore) => state.getConnectionStatus());
};