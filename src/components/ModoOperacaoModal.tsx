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

const MODOS_OPERACAO = [
  'REFRIGERAR',
  'VENTILAR',
  'AUTOMATICO',
  'DESUMIDIFICAR',
];

interface ModoOperacaoModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (modo: string) => void;
  modoAtual: string;
}

export default function ModoOperacaoModal({
  open,
  onClose,
  onSelect,
  modoAtual,
}: ModoOperacaoModalProps) {
  const handleSelect = (modo: string) => {
    onSelect(modo);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Selecionar Modo de Operação</DialogTitle>
      <DialogContent>
        <List>
          {MODOS_OPERACAO.map((modo) => (
            <ListItem key={modo} disablePadding>
              <ListItemButton
                onClick={() => handleSelect(modo)}
                selected={modo === modoAtual}
              >
                <ListItemText primary={modo} />
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