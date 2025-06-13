'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

interface DispositivoControle {
  idEsp32: string;
  modeloEsp32?: string;
}

interface EditarDispositivoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (id: string, dados: { modeloEsp32?: string }) => Promise<void>;
  dispositivo: DispositivoControle;
}

export default function EditarDispositivoModal({
  open,
  onClose,
  onSave,
  dispositivo,
}: EditarDispositivoModalProps) {
  const [modelo, setModelo] = useState(dispositivo.modeloEsp32 || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(dispositivo.idEsp32, {
        modeloEsp32: modelo || undefined,
      });
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModelo(dispositivo.modeloEsp32 || '');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Dispositivo</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <TextField
            margin="dense"
            label="ID do ESP32"
            value={dispositivo.idEsp32}
            disabled
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            label="Modelo"
            type="text"
            fullWidth
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}