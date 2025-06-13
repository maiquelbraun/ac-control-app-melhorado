import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message = 'Ocorreu um erro ao carregar os dados.', 
  onRetry,
  fullScreen = false 
}) => {
  const content = (
    <Box className="flex flex-col items-center justify-center space-y-4 text-center">
      <ErrorOutlineIcon className="text-red-500 text-6xl" />
      <Typography variant="h6" className="text-gray-800">
        Ops! Algo deu errado.
      </Typography>
      <Typography variant="body1" className="text-gray-600 max-w-md">
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          className="mt-4 text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          Tentar Novamente
        </Button>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {content}
      </Box>
    );
  }

  return (
    <Box className="flex items-center justify-center p-8">
      {content}
    </Box>
  );
};

export default ErrorMessage;