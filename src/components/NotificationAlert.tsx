import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationAlertProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  open,
  onClose,
  message,
  severity = 'success',
  autoHideDuration = 6000,
  position = {
    vertical: 'bottom',
    horizontal: 'right',
  },
}) => {
  const getBackgroundColor = (severity: AlertColor) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getTextColor = (severity: AlertColor) => {
    switch (severity) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={position}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        className={`${getBackgroundColor(severity)} ${getTextColor(severity)} shadow-lg`}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Helper function to create a notification context and hooks
export const createNotificationContext = () => {
  interface NotificationContextType {
    showNotification: (props: Omit<NotificationAlertProps, 'open' | 'onClose'>) => void;
  }

  const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

  const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = React.useState<NotificationAlertProps | null>(null);

    const showNotification = (props: Omit<NotificationAlertProps, 'open' | 'onClose'>) => {
      setNotification({ ...props, open: true, onClose: () => setNotification(null) });
    };

    return (
      <NotificationContext.Provider value={{ showNotification }}>
        {children}
        {notification && <NotificationAlert {...notification} />}
      </NotificationContext.Provider>
    );
  };

  const useNotification = () => {
    const context = React.useContext(NotificationContext);
    if (context === undefined) {
      throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
  };

  return { NotificationProvider, useNotification };
};

export default NotificationAlert;