// ac-control-app/src/app/gerenciamento/dispositivos/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { DispositivoControle as DispositivoType } from '@/types/dispositivo';

export default function GerenciamentoDispositivosPage() {
  const [dispositivos, setDispositivos] = useState<DispositivoType[]>([]);
  const [novoDispositivo, setNovoDispositivo] = useState({
    idEsp32: '',
    modeloEsp32: '',
    firmwareVersion: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDispositivos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dispositivos-controle');
      if (!response.ok) throw new Error(`Erro ao buscar dispositivos: ${response.statusText}`);
      const data = await response.json();
      setDispositivos(data);
    } catch (e: Error) {
      setError(e.message);
      console.error("Falha ao buscar dispositivos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDispositivos();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNovoDispositivo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitNovoDispositivo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!novoDispositivo.idEsp32.trim()) {
      setError("O ID do ESP32 (MAC Address ou similar) é obrigatório.");
      return;
    }

    try {
      const response = await fetch('/api/dispositivos-controle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoDispositivo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao criar dispositivo: ${response.statusText}`);
      }
      const dispositivoCriado = await response.json();
      await fetchDispositivos(); // Recarrega a lista
      setNovoDispositivo({ idEsp32: '', modeloEsp32: '', firmwareVersion: '' }); // Limpa o formulário
      setSuccessMessage(`Dispositivo "${dispositivoCriado.idEsp32}" criado com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: Error) {
      setError(e.message);
      console.error("Falha ao criar dispositivo:", e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciamento de Dispositivos de Controle</h1>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Erro: {error}</p>}
      {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded mb-4">{successMessage}</p>}

      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Adicionar Novo Dispositivo</h2>
        <form onSubmit={handleSubmitNovoDispositivo} className="space-y-4">
          <div>
            <label htmlFor="idEsp32" className="block text-sm font-medium text-gray-700">
              ID do Dispositivo (ESP32 MAC Address):
            </label>
            <input
              type="text"
              id="idEsp32"
              name="idEsp32"
              value={novoDispositivo.idEsp32}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="modeloEsp32" className="block text-sm font-medium text-gray-700">
              Modelo do ESP32 (Opcional):
            </label>
            <input
              type="text"
              id="modeloEsp32"
              name="modeloEsp32"
              value={novoDispositivo.modeloEsp32}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="firmwareVersion" className="block text-sm font-medium text-gray-700">
              Versão do Firmware (Opcional):
            </label>
            <input
              type="text"
              id="firmwareVersion"
              name="firmwareVersion"
              value={novoDispositivo.firmwareVersion}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Adicionar Dispositivo
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-700 p-6 border-b">Dispositivos Existentes</h2>
        {isLoading && <p className="p-6">Carregando dispositivos...</p>}
        {!isLoading && dispositivos.length === 0 && !error && (
          <p className="p-6 text-gray-500">Nenhum dispositivo cadastrado ainda.</p>
        )}
        {!isLoading && dispositivos.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {dispositivos.map((dispositivo) => (
              <li key={dispositivo.idEsp32} className="p-6 hover:bg-gray-50">
                 <p className="text-lg font-medium text-indigo-600">{dispositivo.idEsp32}</p>
                 <p className="text-sm text-gray-500">Modelo: {dispositivo.modeloEsp32 || 'N/A'} | Firmware: {dispositivo.firmwareVersion || 'N/A'}</p>
                 <p className={`text-xs ${dispositivo.online ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {dispositivo.online ? 'Online' : 'Offline'}
                    {dispositivo.ultimoContato && ` - Último contato: ${new Date(dispositivo.ultimoContato).toLocaleString()}`}
                 </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}