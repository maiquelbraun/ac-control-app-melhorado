import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  // NOTE: If "ARIA hidden element must not contain focusable elements" warning persists,
  // investigate focus management and ensure elements outside the modal are
  // properly inaccessible when the modal is open. Material-UI's Dialog
  // should handle this by default, but conflicts can arise with custom
  // focus traps or other libraries.

  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  closeOnBackdropClick = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' && !closeOnBackdropClick) {
          return;
        }
        onClose();
      }}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className="rounded-lg"
    >
      <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">
        <Typography variant="h6" component="div" className="font-bold text-gray-800">
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent className="p-6">
        {children}
      </DialogContent>

      {actions && (
        <DialogActions className="bg-gray-50 border-t p-4">
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// Confirmation modal component for common use cases
interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'primary',
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onClose} className="text-gray-600">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color={confirmColor}
            className={`
              ${confirmColor === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <Typography variant="body1" className="text-gray-600">
        {message}
      </Typography>
    </Modal>
  );
};

export default Modal;