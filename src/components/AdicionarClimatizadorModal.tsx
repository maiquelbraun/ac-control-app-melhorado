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
import { Climatizador, CreateClimatizadorInput } from '@/types/climatizador';

interface Sala {
  id: string;
  nome: string;
  bloco: {
    id: string;
    nome: string;
  };
}

interface DispositivoControle {
  idEsp32: string;
  modeloEsp32?: string;
}

interface AdicionarClimatizadorModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (climatizador: Climatizador) => void;
}

export default function AdicionarClimatizadorModal({
  open,
  onClose,
  onAdd,
}: AdicionarClimatizadorModalProps) {
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [salaId, setSalaId] = useState('');
  const [dispositivoId, setDispositivoId] = useState('');
  const [salas, setSalas] = useState<Sala[]>([]);
  const [dispositivos, setDispositivos] = useState<DispositivoControle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salasRes, dispositivosRes] = await Promise.all([
          fetch('/api/salas'),
          fetch('/api/dispositivos-controle'),
        ]);

        const salasData = await salasRes.json();
        const dispositivosData = await dispositivosRes.json();

        if (salasData.success) setSalas(salasData.data);
        if (dispositivosData.success) setDispositivos(dispositivosData.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados necessários');
      }
    };

    if (open) {
      setError(null);
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !salaId || !dispositivoId) return;

    setLoading(true);
    setError(null);

    try {
      const climatizadorInput: CreateClimatizadorInput = {
        nome,
        marca,
        modelo,
        salaId,
        dispositivoControleId: dispositivoId,
      };

      const response = await fetch('/api/climatizadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(climatizadorInput),
      });

      const { success, data, message } = await response.json();
      
      if (success) {
        onAdd(data);
        handleClose();
      } else {
        setError(message || 'Erro ao adicionar climatizador');
      }
    } catch (error) {
      console.error('Erro ao adicionar climatizador:', error);
      setError('Erro ao adicionar climatizador');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setMarca('');
    setModelo('');
    setSalaId('');
    setDispositivoId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Novo Climatizador</DialogTitle>
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Sala</InputLabel>
            <Select
              value={salaId}
              onChange={(e) => setSalaId(e.target.value)}
              required
            >
              {salas.map((sala) => (
                <MenuItem key={sala.id} value={sala.id}>
                  {`${sala.bloco.nome} - ${sala.nome}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Dispositivo de Controle</InputLabel>
            <Select
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
              required
            >
              {dispositivos.map((dispositivo) => (
                <MenuItem key={dispositivo.idEsp32} value={dispositivo.idEsp32}>
                  {dispositivo.modeloEsp32 || dispositivo.idEsp32}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !nome || !salaId || !dispositivoId}
          >
            {loading ? <CircularProgress size={24} /> : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}