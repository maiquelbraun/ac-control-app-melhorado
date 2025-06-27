import { NextRequest, NextResponse } from 'next/server';
import { isAppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  executionTime?: number;
}

type ApiHandler = (
  req: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<Response>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context) => {
    const startTime = Date.now();

    try {
      const response = await handler(req, context);
      const executionTime = Date.now() - startTime;

      // If response is already formatted, just add execution time
      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(
          { ...data, executionTime },
          { status: response.status }
        );
      }

      // Format unformatted responses
      return NextResponse.json(
        {
          success: response.ok,
          data: response,
          executionTime
        },
        { status: response.status }
      );
    } catch (error) {
      logger.error('API Error:', error);

      if (isAppError(error)) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            error: error.code,
            executionTime: Date.now() - startTime
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro interno do servidor',
          error: process.env.NODE_ENV === 'development' 
            ? (error as Error).message 
            : undefined,
          executionTime: Date.now() - startTime
        },
        { status: 500 }
      );
    }
  };
}

export function validateRequest<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T {
  if (!validator(data)) {
    throw new Error('Dados de requisição inválidos');
  }
  return data;
}