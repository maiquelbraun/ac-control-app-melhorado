'use client';

import { useConnectionStatus } from '@/services/websocket';

export function ConnectionStatus() {
  const { connected, connecting, lastError, reconnectAttempts } = useConnectionStatus();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          connected
            ? 'bg-green-500'
            : connecting
            ? 'bg-yellow-500 animate-pulse'
            : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        {connected
          ? 'Conectado'
          : connecting
          ? 'Conectando...'
          : 'Desconectado'}
      </span>
      {lastError && (
        <span className="text-sm text-red-500 ml-2">
          {lastError}
          {reconnectAttempts > 0 && ` (Tentativa ${reconnectAttempts})`}
        </span>
      )}
    </div>
  );
}