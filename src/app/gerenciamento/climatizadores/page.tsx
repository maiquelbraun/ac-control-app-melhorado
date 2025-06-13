'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, Suspense } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Climatizador, ClimatizadorUI, ModoOperacao, VelocidadeVentilador, isModoOperacao, isVelocidadeVentilador, toClimatizadorUI } from '@/types/climatizador';

const ClimatizadorCard = dynamic(
  () => import('@/components/ClimatizadorCard').then(mod => mod.ClimatizadorCard), 
  { loading: () => <Box className="w-full h-64 animate-pulse bg-gray-100 rounded-lg" /> }
);

const AdicionarClimatizadorModal = dynamic(
  () => import('@/components/AdicionarClimatizadorModal'),
  { ssr: false }
);

export default function ClimatizadoresPage() {
  const [climatizadores, setClimatizadores] = useState<Climatizador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchClimatizadores() {
    try {
      const response = await fetch('/api/climatizadores');
      const { success, data, message, error } = await response.json();
      
      if (!response.ok) {
        throw new Error(message || 'Erro ao buscar climatizadores');
      }
      
      if (success && Array.isArray(data)) {
        setClimatizadores(data);
      } else {
        setError('Resposta inválida do servidor');
      }
    } catch (error: any) {
      const errorDetails = {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        status: error?.status,
        statusText: error?.statusText,
        ...(error?.response && { response: error.response }),
      };
      
      console.error('Erro detalhado ao carregar climatizadores:', errorDetails);
      setClimatizadores([]);
      setError(error instanceof Error ? error.message : 'Erro ao carregar climatizadores');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClimatizadores();
  }, []);

  const handlePowerToggle = async (id: string) => {
    try {
      const climatizador = climatizadores.find(c => c.id === id);
      if (!climatizador) return;

      const response = await fetch(`/api/climatizadores/${id}/comando`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comando: climatizador.ligado ? 'DESLIGAR' : 'LIGAR'
        }),
      });

      const { success, message } = await response.json();

      if (success) {
        setClimatizadores(prev =>
          prev.map(c =>
            c.id === id ? { ...c, ligado: !c.ligado } : c
          )
        );
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error('Erro ao alternar estado:', error);
      setError(error instanceof Error ? error.message : 'Erro ao alternar estado');
    }
  };

  const handleTemperaturaChange = async (id: string, temperatura: number) => {
    try {
      const response = await fetch(`/api/climatizadores/${id}/comando`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comando: 'TEMPERATURA',
          valor: temperatura
        }),
      });

      const { success, message } = await response.json();

      if (success) {
        setClimatizadores(prev =>
          prev.map(c =>
            c.id === id ? { ...c, temperaturaDesejada: temperatura } : c
          )
        );
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error('Erro ao alterar temperatura:', error);
      setError(error instanceof Error ? error.message : 'Erro ao alterar temperatura');
    }
  };

  const handleModoOperacaoChange = async (id: string, modo: string) => {
    try {
      const response = await fetch(`/api/climatizadores/${id}/comando`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comando: 'MODO_OPERACAO',
          valor: modo
        }),
      });

      const { success, message } = await response.json();

      if (success && isModoOperacao(modo)) {
        setClimatizadores(prev =>
          prev.map(c =>
            c.id === id ? { ...c, modoOperacao: modo } : c
          )
        );
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error('Erro ao alterar modo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao alterar modo');
    }
  };

  const handleVelocidadeChange = async (id: string, velocidade: string) => {
    try {
      const response = await fetch(`/api/climatizadores/${id}/comando`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comando: 'VELOCIDADE',
          valor: velocidade
        }),
      });

      const { success, message } = await response.json();

      if (success && isVelocidadeVentilador(velocidade)) {
        setClimatizadores(prev =>
          prev.map(c =>
            c.id === id ? { ...c, velocidadeVentilador: velocidade } : c
          )
        );
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error('Erro ao alterar velocidade:', error);
      setError(error instanceof Error ? error.message : 'Erro ao alterar velocidade');
    }
  };

  const handleAddClimatizador = (novoClimatizador: Climatizador) => {
    setClimatizadores(prev => [...prev, novoClimatizador]);
    setModalOpen(false);
  };

  const filteredClimatizadores = climatizadores.filter((climatizador: Climatizador) =>
    climatizador.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" className="py-8 animate-fadeIn">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h4" className="font-bold text-gray-800">
          Gerenciamento de Climatizadores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setModalOpen(true)}
        >
          Adicionar Climatizador
        </Button>
      </Box>

      <Box className="mb-6">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar climatizadores..."
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

      <Suspense fallback={
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      }>
        {loading ? (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box className="flex justify-center items-center h-64">
            <div className="text-center">
              <Typography variant="h6" color="error" gutterBottom>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchClimatizadores();
                }}
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            </div>
          </Box>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClimatizadores.map((climatizador) => (
              <ClimatizadorCard
                key={climatizador.id}
                {...toClimatizadorUI(climatizador)}
                onPowerToggle={handlePowerToggle}
                onTemperaturaChange={handleTemperaturaChange}
                onModoOperacaoChange={(id, modo) => 
                  isModoOperacao(modo) && handleModoOperacaoChange(id, modo)
                }
                onVelocidadeChange={(id, velocidade) => 
                  isVelocidadeVentilador(velocidade) && handleVelocidadeChange(id, velocidade)
                }
                onEdit={async (id: string, dados: Partial<Climatizador>) => {
                  try {
                    const response = await fetch(`/api/climatizadores/${id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(dados),
                    });

                    const { success, data, message } = await response.json();

                    if (success) {
                      setClimatizadores(prev =>
                        prev.map(c => c.id === id ? { ...c, ...data } : c)
                      );
                    } else {
                      throw new Error(message);
                    }
                  } catch (error: any) {
                    console.error('Erro ao editar climatizador:', error);
                    throw error;
                  }
                }}
                onDelete={async (id: string) => {
                  try {
                    const response = await fetch(`/api/climatizadores/${id}`, {
                      method: 'DELETE',
                    });

                    const { success, message } = await response.json();

                    if (success) {
                      setClimatizadores(prev =>
                        prev.filter(c => c.id !== id)
                      );
                    } else {
                      throw new Error(message);
                    }
                  } catch (error: any) {
                    console.error('Erro ao excluir climatizador:', error);
                    throw error;
                  }
                }}
              />
            ))}
          </div>
        )}

        {!loading && filteredClimatizadores.length === 0 && (
          <Box className="text-center py-16">
            <Typography variant="h6" className="text-gray-500">
              Nenhum climatizador encontrado
            </Typography>
          </Box>
        )}

        <AdicionarClimatizadorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddClimatizador}
        />
      </Suspense>
    </Container>
  );
}