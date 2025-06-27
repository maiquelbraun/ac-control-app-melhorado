type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private logs: LogMessage[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, ...data: unknown[]) {
    const logMessage: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data.length ? data : undefined
    };

    // Add to memory buffer
    this.logs.push(logMessage);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with appropriate styling
    const consoleMessage = `[${logMessage.timestamp}] [${level.toUpperCase()}] ${message}`;
    switch (level) {
      case 'info':
        console.info(consoleMessage, ...data);
        break;
      case 'warn':
        console.warn(consoleMessage, ...data);
        break;
      case 'error':
        console.error(consoleMessage, ...data);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(consoleMessage, ...data);
        }
        break;
    }

    // In production, we could send logs to a service like Sentry or store them in the database
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // TODO: Implement production error logging
      // this.sendToErrorTrackingService(logMessage);
    }
  }

  public info(message: string, ...data: unknown[]) {
    this.log('info', message, ...data);
  }

  public warn(message: string, ...data: unknown[]) {
    this.log('warn', message, ...data);
  }

  public error(message: string, ...data: unknown[]) {
    this.log('error', message, ...data);
  }

  public debug(message: string, ...data: unknown[]) {
    this.log('debug', message, ...data);
  }

  public getLogs(level?: LogLevel): LogMessage[] {
    return level 
      ? this.logs.filter(log => log.level === level)
      : [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();