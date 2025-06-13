export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConnectionError extends AppError {
  constructor(message: string) {
    super(message, 503, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}