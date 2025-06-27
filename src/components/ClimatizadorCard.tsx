'use client';

import { useState } from 'react';
import { Button, Card, Slider } from '@/components/ui';
import { 
  ClimatizadorUI 
} from '@/types/climatizador';
import { useMQTTContext } from './MqttProvider';
import ModoOperacaoModal from './ModoOperacaoModal';
import VelocidadeModal from './VelocidadeModal';
import EditarClimatizadorModal from './EditarClimatizadorModal';
import { logger } from '@/lib/logger';

interface ClimatizadorStatus {
  online?: boolean;
  temperaturaAtual?: number;
  error?: string;
  ultimaAtualizacao?: number;
}

interface ClimatizadorCardProps extends Pick<ClimatizadorUI, 
  | 'id' 
  | 'nome' 
  | 'ligado' 
  | 'statusOperacional'
  | 'salaId'
  | 'dispositivoControleId'
  | 'ultimaAtualizacao'
  | 'marca'
  | 'modelo'
  | 'temperaturaDesejada'
  | 'modoOperacao'
  | 'velocidadeVentilador'
> {
  onPowerToggle: (id: string) => Promise<void>;
  onTemperaturaChange: (id: string, temp: number) => Promise<void>;
  onModoOperacaoChange: (id: string, modo: string) => Promise<void>;
  onVelocidadeChange: (id: string, velocidade: string) => Promise<void>;
  onEdit: (id: string, dados: { nome: string; marca?: string; modelo?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ClimatizadorCard({
  id,
  nome,
  statusOperacional,
  ligado,
  temperaturaDesejada = 23,
  modoOperacao,
  velocidadeVentilador,
  marca,
  modelo,
  dispositivoControleId,
  salaId,
  ultimaAtualizacao,
  onPowerToggle,
  onTemperaturaChange,
  onModoOperacaoChange,
  onVelocidadeChange,
  onEdit,
  onDelete,
}: ClimatizadorCardProps) {
  const [modoModalOpen, setModoModalOpen] = useState(false);
  const [velocidadeModalOpen, setVelocidadeModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { isConnected, deviceStatuses, publishCommand } = useMQTTContext();
  const deviceStatus = deviceStatuses[`dispositivos/${dispositivoControleId}`] as ClimatizadorStatus;

  const handleCommand = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      if (isConnected) {
        publishCommand(dispositivoControleId, {
          comando: 'UPDATE',
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      logger.error('Erro ao enviar comando:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este climatizador?')) return;
    await handleCommand(() => onDelete(id));
  };

  return (
    <>
      <Card
        title={nome}
        error={deviceStatus?.online ? deviceStatus?.error : 'Dispositivo offline'}
        loading={loading}
        className="w-full max-w-sm"
        subtitle={deviceStatus?.error}
        contentClassName="space-y-6"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-blue-600">
              {temperaturaDesejada}°C
            </div>
            {deviceStatus?.temperaturaAtual && (
              <div className="text-sm text-gray-500">
                Atual: {deviceStatus.temperaturaAtual}°C
              </div>
            )}
          </div>
          
          <Button
            variant={ligado ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleCommand(() => onPowerToggle(id))}
            disabled={loading || !deviceStatus?.online}
          >
            {ligado ? 'Ligado' : 'Desligado'}
          </Button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <Slider
            label="Temperatura"
            value={temperaturaDesejada ?? 23}
            min={16}
            max={30}
            step={1}
            disabled={!ligado || loading || !deviceStatus?.online}
            onChange={(value) => handleCommand(() => onTemperaturaChange(id, value))}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Modo: {modoOperacao ?? 'AUTO'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModoModalOpen(true)}
              disabled={!ligado || loading || !deviceStatus?.online}
            >
              Alterar
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Velocidade: {velocidadeVentilador ?? 'AUTO'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVelocidadeModalOpen(true)}
              disabled={!ligado || loading || !deviceStatus?.online}
            >
              Ajustar
            </Button>
          </div>
        </div>

        {(marca || modelo) && (
          <div className="text-sm text-gray-500">
            {[marca, modelo].filter(Boolean).join(' - ')}
          </div>
        )}
      </Card>

      <ModoOperacaoModal
        open={modoModalOpen}
        onClose={() => setModoModalOpen(false)}
        onSelect={(modo) => handleCommand(() => onModoOperacaoChange(id, modo))}
        modoAtual={modoOperacao ?? 'AUTOMATICO'}
      />

      <VelocidadeModal
        open={velocidadeModalOpen}
        onClose={() => setVelocidadeModalOpen(false)}
        onSelect={(velocidade) => handleCommand(() => onVelocidadeChange(id, velocidade))}
        velocidadeAtual={velocidadeVentilador ?? 'AUTOMATICO'}
      />

      <EditarClimatizadorModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={onEdit}
        climatizador={{
          id,
          nome,
          ligado,
          statusOperacional,
          salaId,
          dispositivoControleId,
          ultimaAtualizacao,
          marca: marca ?? undefined,
          modelo: modelo ?? undefined,
          temperaturaDesejada: temperaturaDesejada ?? undefined,
          modoOperacao: modoOperacao ?? undefined,
          velocidadeVentilador: velocidadeVentilador ?? undefined
        }}
      />
    </>
  );
}