import React from 'react';
import { Container, Typography, Paper, Button } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Container maxWidth="lg" className="pt-16">
        <div className="text-center space-y-8">
          <Typography variant="h2" className="font-bold text-blue-800 mb-4">
            Bem-vindo ao Sistema de Controle de Climatização
          </Typography>
          
          <Typography variant="h5" className="text-gray-600 mb-8">
            Gerencie seus equipamentos de climatização de forma inteligente e eficiente
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Paper elevation={3} className="p-6 transform transition-all hover:scale-105">
              <Typography variant="h6" className="text-blue-700 mb-3">
                Salas
              </Typography>
              <Typography className="text-gray-600 mb-4">
                Gerencie suas salas e configure os climatizadores de acordo com suas necessidades.
              </Typography>
              <Link href="/gerenciamento/salas">
                <Button variant="contained" className="bg-blue-600 hover:bg-blue-700">
                  Acessar Salas
                </Button>
              </Link>
            </Paper>

            <Paper elevation={3} className="p-6 transform transition-all hover:scale-105">
              <Typography variant="h6" className="text-blue-700 mb-3">
                Climatizadores
              </Typography>
              <Typography className="text-gray-600 mb-4">
                Monitore e controle seus climatizadores em tempo real.
              </Typography>
              <Link href="/gerenciamento/climatizadores">
                <Button variant="contained" className="bg-blue-600 hover:bg-blue-700">
                  Acessar Climatizadores
                </Button>
              </Link>
            </Paper>

            <Paper elevation={3} className="p-6 transform transition-all hover:scale-105">
              <Typography variant="h6" className="text-blue-700 mb-3">
                Dispositivos
              </Typography>
              <Typography className="text-gray-600 mb-4">
                Gerencie seus dispositivos de controle e monitore seu status.
              </Typography>
              <Link href="/gerenciamento/dispositivos">
                <Button variant="contained" className="bg-blue-600 hover:bg-blue-700">
                  Acessar Dispositivos
                </Button>
              </Link>
            </Paper>
          </div>

          <Paper elevation={0} className="mt-12 p-8 bg-blue-50">
            <Typography variant="h5" className="text-blue-800 mb-4">
              Estatísticas Rápidas
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4">
                <Typography variant="h4" className="text-blue-600 font-bold">
                  24/7
                </Typography>
                <Typography className="text-gray-600">
                  Monitoramento Contínuo
                </Typography>
              </div>
              <div className="p-4">
                <Typography variant="h4" className="text-blue-600 font-bold">
                  100%
                </Typography>
                <Typography className="text-gray-600">
                  Controle Automático
                </Typography>
              </div>
              <div className="p-4">
                <Typography variant="h4" className="text-blue-600 font-bold">
                  Tempo Real
                </Typography>
                <Typography className="text-gray-600">
                  Atualização de Status
                </Typography>
              </div>
            </div>
          </Paper>
        </div>
      </Container>
    </div>
  );
}
