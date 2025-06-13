import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  fullScreen = false 
}) => {
  const content = (
    <Box className="flex flex-col items-center justify-center space-y-4">
      <CircularProgress className="text-blue-600" />
      {message && (
        <Typography variant="body1" className="text-gray-600">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
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

export default LoadingSpinner;