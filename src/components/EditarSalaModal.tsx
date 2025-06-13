'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Bloco, Sala, SalaInput } from '@/types/sala';

interface EditarSalaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (sala: SalaInput) => Promise<void>;
  salaParaEditar?: Sala;
}

export default function EditarSalaModal({
  open,
  onClose,
  onSave,
  salaParaEditar,
}: EditarSalaModalProps) {
  const [nome, setNome] = useState('');
  const [blocoId, setBlocoId] = useState('');
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBlocos, setLoadingBlocos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlocos = async () => {
      setLoadingBlocos(true);
      try {
        const response = await fetch('/api/blocos');
        const { success, data } = await response.json();
        if (success && Array.isArray(data)) {
          setBlocos(data);
        } else {
          console.error('Erro ao carregar blocos');
        }
      } catch (error) {
        console.error('Erro ao carregar blocos:', error);
      } finally {
        setLoadingBlocos(false);
      }
    };

    if (open) {
      fetchBlocos();
      
      if (salaParaEditar) {
        setNome(salaParaEditar.nome);
        setBlocoId(salaParaEditar.blocoId);
      } else {
        setNome('');
        setBlocoId('');
      }
    }
  }, [open, salaParaEditar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !blocoId) return;

    setLoading(true);
    setError(null);

    try {
      const sala: SalaInput = {
        ...(salaParaEditar?.id ? { id: salaParaEditar.id } : {}),
        nome,
        blocoId,
      };

      await onSave(sala);
      handleClose();
    } catch (error: any) {
      console.error('Erro ao salvar sala:', error);
      setError(error.message || 'Erro ao salvar sala');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setBlocoId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{salaParaEditar ? 'Editar' : 'Adicionar'} Sala</DialogTitle>
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
            label="Nome da Sala"
            type="text"
            fullWidth
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mb-4"
          />
          <FormControl fullWidth required>
            <InputLabel>Bloco</InputLabel>
            <Select
              value={blocoId}
              onChange={(e) => setBlocoId(e.target.value)}
              disabled={loadingBlocos}
            >
              {loadingBlocos ? (
                <MenuItem value="">
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                blocos.map((bloco) => (
                  <MenuItem key={bloco.id} value={bloco.id}>
                    {bloco.nome}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !nome || !blocoId}
          >
            {loading ? <CircularProgress size={24} /> : salaParaEditar ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}