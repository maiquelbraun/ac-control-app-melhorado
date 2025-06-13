'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';

const VELOCIDADES = [
  'BAIXA',
  'MEDIA',
  'ALTA',
  'AUTOMATICO',
];

interface VelocidadeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (velocidade: string) => void;
  velocidadeAtual: string;
}

export default function VelocidadeModal({
  open,
  onClose,
  onSelect,
  velocidadeAtual,
}: VelocidadeModalProps) {
  const handleSelect = (velocidade: string) => {
    onSelect(velocidade);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Selecionar Velocidade do Ventilador</DialogTitle>
      <DialogContent>
        <List>
          {VELOCIDADES.map((velocidade) => (
            <ListItem key={velocidade} disablePadding>
              <ListItemButton
                onClick={() => handleSelect(velocidade)}
                selected={velocidade === velocidadeAtual}
              >
                <ListItemText primary={velocidade} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}