// ac-control-app/src/app/controle/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Climatizador as ClimatizadorTypePrisma, 
  Sala as SalaTypePrisma, 
  Bloco as BlocoTypePrisma,
  DispositivoControle as DispositivoControleTypePrisma,
  ModoOperacaoClimatizador,
  VelocidadeVentiladorClimatizador
} from '@prisma/client';

// Reutilizando interfaces (poderiam ser movidas para um arquivo de tipos compartilhado)
interface SalaComBloco extends SalaTypePrisma {
  bloco: BlocoTypePrisma | null;
}
interface ClimatizadorCompleto extends ClimatizadorTypePrisma {
  sala: SalaComBloco | null;
  dispositivoControle: DispositivoControleTypePrisma | null;
  potencia?: number | null;
}

// Tipos para os botões de comando
type AcaoComando = 'ligar' | 'desligar' | 'set_temperatura' | 'set_modo' | 'set_velocidade';

export default function ControlePage() {
  const params = useParams();
  const climatizadorId = params.id as string;

  const [climatizador, setClimatizador] = useState<ClimatizadorCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comandoStatus, setComandoStatus] = useState<string | null>(null);
  const [novaTemperatura, setNovaTemperatura] = useState<number>(22); // Default temp

  const fetchClimatizador = async () => {
    if (!climatizadorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/climatizadores/${climatizadorId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao buscar climatizador: ${response.statusText}`);
      }
      const data = await response.json();
      setClimatizador(data);
      if (data.temperaturaDesejada) {
        setNovaTemperatura(data.temperaturaDesejada);
      }
    } catch (e: Error) {
      setError(e.message);
      console.error("Falha ao buscar climatizador:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClimatizador();
  }, [climatizadorId, fetchClimatizador]);

  const enviarComando = async (acao: AcaoComando, valor?: string | number | boolean | ModoOperacaoClimatizador | VelocidadeVentiladorClimatizador) => {
    setComandoStatus("Enviando comando...");
    setError(null);
    try {
      const response = await fetch(`/api/climatizadores/${climatizadorId}/comando`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao, valor }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Erro ao enviar comando: ${response.statusText}`);
      }
      setComandoStatus(data.message || "Comando enviado com sucesso!");
      // Re-buscar dados do climatizador para refletir o novo estado
      await fetchClimatizador(); 
      setTimeout(() => setComandoStatus(null), 3000);
    } catch (e: Error) {
      setError(e.message);
      setComandoStatus(null);
      console.error("Falha ao enviar comando:", e);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Carregando dados do climatizador...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  if (!climatizador) return <div className="p-8 text-center">Climatizador não encontrado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Controle Remoto</h1>
      <h2 className="text-xl font-semibold text-indigo-600 mb-6">{climatizador.nome}</h2>
      
      {comandoStatus && <p className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">{comandoStatus}</p>}

      <div className="bg-white p-6 rounded-lg shadow-xl space-y-6">
        {/* Estado Atual */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Estado Atual</h3>
          <p>Status: <span className={`font-bold ${climatizador.ligado ? 'text-green-600' : 'text-red-600'}`}>{climatizador.ligado ? 'LIGADO' : 'DESLIGADO'}</span></p>
          {climatizador.ligado && (
            <>
              <p>Temperatura: {climatizador.temperaturaDesejada ?? 'N/A'}°C</p>
              <p>Modo: {climatizador.modoOperacao || 'N/A'}</p>
              <p>Ventilador: {climatizador.velocidadeVentilador || 'N/A'}</p>
            </>
          )}
        </div>

        {/* Controles Principais */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => enviarComando('ligar')}
            disabled={climatizador.ligado}
            className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            Ligar
          </button>
          <button
            onClick={() => enviarComando('desligar')}
            disabled={!climatizador.ligado}
            className="w-full py-3 px-4 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Desligar
          </button>
        </div>

        {/* Controle de Temperatura */}
        {climatizador.ligado && (
          <div className="space-y-2">
            <label htmlFor="temperatura" className="block text-sm font-medium text-gray-700">
              Ajustar Temperatura: {novaTemperatura}°C
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                id="temperatura"
                min="16"
                max="30"
                step="1"
                value={novaTemperatura}
                onChange={(e) => setNovaTemperatura(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => enviarComando('set_temperatura', novaTemperatura)}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors text-sm"
              >
                Definir
              </button>
            </div>
          </div>
        )}

        {/* Controle de Modo */}
        {climatizador.ligado && (
          <div className="space-y-2">
            <label htmlFor="modo" className="block text-sm font-medium text-gray-700">Modo de Operação:</label>
            <select
              id="modo"
              value={climatizador.modoOperacao || ''}
              onChange={(e) => enviarComando('set_modo', e.target.value as ModoOperacaoClimatizador)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.values(ModoOperacaoClimatizador).map(modo => (
                <option key={modo} value={modo}>{modo.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        )}

        {/* Controle de Velocidade do Ventilador */}
        {climatizador.ligado && (
          <div className="space-y-2">
            <label htmlFor="velocidade" className="block text-sm font-medium text-gray-700">Velocidade do Ventilador:</label>
            <select
              id="velocidade"
              value={climatizador.velocidadeVentilador || ''}
              onChange={(e) => enviarComando('set_velocidade', e.target.value as VelocidadeVentiladorClimatizador)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.values(VelocidadeVentiladorClimatizador).map(vel => (
                <option key={vel} value={vel}>{vel.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}