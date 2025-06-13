import { useState } from 'react';
import { logger } from '@/lib/logger';
import { isAppError } from '@/lib/errors';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const handleRequest = async <R = T>(
    requestFn: () => Promise<Response>
  ): Promise<R | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await requestFn();
      const result = await response.json() as ApiResponse<R>;

      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido');
      }

      setData(result.data as any);
      options.onSuccess?.(result.data);
      return result.data || null;

    } catch (err) {
      const error = err as Error;
      logger.error('API request failed:', error);
      
      const errorMessage = isAppError(error)
        ? error.message
        : 'Ocorreu um erro na requisição';

      setError(error);
      options.onError?.(error);
      return null;

    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    request: handleRequest,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
}

// Exemplo de uso:
/*
const { loading, error, data, request } = useApi<User>({
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});

// Em algum evento ou efeito:
await request(() => fetch('/api/user'));
*/