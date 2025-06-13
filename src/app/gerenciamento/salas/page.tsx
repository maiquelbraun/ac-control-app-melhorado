'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import EditarSalaModal from '@/components/EditarSalaModal';
import { Sala, SalaInput } from '@/types/sala';

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [salaParaEditar, setSalaParaEditar] = useState<Sala | undefined>();

  const handleOpenModal = (sala?: Sala) => {
    setSalaParaEditar(sala);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSalaParaEditar(undefined);
    setModalOpen(false);
  };

  const handleSaveSala = async (sala: SalaInput) => {
    const url = sala.id ? `/api/salas/${sala.id}` : '/api/salas';
    const method = sala.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sala),
    });

    const { success, data, message } = await response.json();

    if (!success) {
      throw new Error(message || 'Erro ao salvar sala');
    }

    if (sala.id) {
      setSalas(prev => prev.map(s => s.id === sala.id ? data : s));
    } else {
      setSalas(prev => [...prev, data]);
    }
  };

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const response = await fetch('/api/salas');
        const { success, data, message } = await response.json();
        
        if (success && data) {
          setSalas(data);
        } else {
          console.error('Erro ao carregar salas:', message);
        }
      } catch (error) {
        console.error('Erro ao carregar salas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return;

    try {
      const response = await fetch(`/api/salas/${id}`, {
        method: 'DELETE',
      });

      const { success, message } = await response.json();

      if (success) {
        setSalas(prev => prev.filter(sala => sala.id !== id));
      } else {
        alert(message || 'Erro ao excluir sala');
      }
    } catch (error) {
      console.error('Erro ao excluir sala:', error);
      alert('Erro ao excluir sala');
    }
  };

  const filteredSalas = salas.filter(sala =>
    sala.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sala.bloco.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" className="py-8 animate-fadeIn">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h4" className="font-bold text-gray-800">
          Gerenciamento de Salas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => handleOpenModal()}
        >
          Adicionar Sala
        </Button>
      </Box>

      <Box className="mb-6">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar salas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          className="bg-white rounded-lg"
        />
      </Box>

      {loading ? (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalas.map((sala) => (
            <Card key={sala.id} className="shadow-lg transform transition-all hover:scale-105">
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Box className="flex items-center">
                    <MeetingRoomIcon className="text-blue-600 mr-2" />
                    <Typography variant="h6" className="font-bold text-gray-800">
                      {sala.nome}
                    </Typography>
                  </Box>
                  <Chip
                    label={sala.bloco.nome}
                    color="primary"
                    size="small"
                    className="bg-blue-100 text-blue-700"
                  />
                </Box>

                <Box className="mb-4">
                  <Typography variant="subtitle2" className="text-gray-500 mb-2">
                    Climatizadores
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {sala.climatizadores.map((climatizador) => (
                      <Chip
                        key={climatizador.id}
                        icon={<AcUnitIcon />}
                        label={climatizador.nome}
                        size="small"
                        className="bg-gray-100"
                      />
                    ))}
                    {sala.climatizadores.length === 0 && (
                      <Typography variant="body2" className="text-gray-500">
                        Nenhum climatizador configurado
                      </Typography>
                    )}
                  </div>
                </Box>
              </CardContent>
              <CardActions className="bg-gray-50 px-4 py-2">
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  className="text-blue-600"
                  onClick={() => handleOpenModal(sala)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  className="text-red-600"
                  onClick={() => handleDelete(sala.id)}
                >
                  Excluir
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredSalas.length === 0 && (
        <Box className="text-center py-16">
          <Typography variant="h6" className="text-gray-500">
            Nenhuma sala encontrada
          </Typography>
        </Box>
      )}

      <EditarSalaModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSala}
        salaParaEditar={salaParaEditar}
      />
    </Container>
  );
}