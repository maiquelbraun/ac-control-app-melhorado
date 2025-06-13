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
import { Climatizador } from '@/types/climatizador';

interface EditarClimatizadorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (id: string, dados: { nome: string; marca?: string; modelo?: string }) => Promise<void>;
  climatizador: Climatizador;
}

export default function EditarClimatizadorModal({
  open,
  onClose,
  onSave,
  climatizador,
}: EditarClimatizadorModalProps) {
  const [nome, setNome] = useState(climatizador.nome);
  const [marca, setMarca] = useState(climatizador.marca || '');
  const [modelo, setModelo] = useState(climatizador.modelo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    setLoading(true);
    setError(null);

    try {
      await onSave(climatizador.id, {
        nome,
        marca: marca || undefined,
        modelo: modelo || undefined,
      });
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar climatizador');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNome(climatizador.nome);
    setMarca(climatizador.marca || '');
    setModelo(climatizador.modelo || '');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Climatizador</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            type="text"
            fullWidth
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Marca"
            type="text"
            fullWidth
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
          <TextField
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
            disabled={loading || !nome}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}