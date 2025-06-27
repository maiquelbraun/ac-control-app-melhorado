// ac-control-app/src/app/gerenciamento/blocos/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Bloco as BlocoType } from '@prisma/client';

interface BlocoComSalas extends BlocoType {
  salas: { id: string; nome: string }[];
}

export default function GerenciamentoBlocosPage() {
  const [blocos, setBlocos] = useState<BlocoComSalas[]>([]);
  const [nomeNovoBloco, setNomeNovoBloco] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [blocoEditando, setBlocoEditando] = useState<BlocoComSalas | null>(null);
  const [nomeEditBloco, setNomeEditBloco] = useState('');

  const fetchBlocos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blocos');
      if (!response.ok) {
        throw new Error(`Erro ao buscar blocos: ${response.statusText}`);
      }
      const data = await response.json();
      setBlocos(data);
    } catch (e: Error) {
      setError(e.message);
      console.error("Falha ao buscar blocos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocos();
  }, []);

  const handleSubmitNovoBloco = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!nomeNovoBloco.trim()) {
      setError("O nome do bloco não pode ser vazio.");
      return;
    }

    try {
      const response = await fetch('/api/blocos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeNovoBloco }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao criar bloco: ${response.statusText}`);
      }

      const blocoCriado = await response.json();
      await fetchBlocos();
      setNomeNovoBloco('');
      setSuccessMessage(`Bloco "${blocoCriado.nome}" criado com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: Error) {
      setError(e.message);
      console.error("Falha ao criar bloco:", e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciamento de Blocos</h1>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Erro: {error}</p>}
      {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded mb-4">{successMessage}</p>}

      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Adicionar Novo Bloco</h2>
        <form onSubmit={handleSubmitNovoBloco} className="space-y-4">
          <div>
            <label htmlFor="nomeNovoBloco" className="block text-sm font-medium text-gray-700">
              Nome do Bloco:
            </label>
            <input
              type="text"
              id="nomeNovoBloco"
              value={nomeNovoBloco}
              onChange={(e) => setNomeNovoBloco(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Adicionar Bloco
          </button>
        </form>
      </div>

      {/* Modal de edição */}
      {editModalOpen && blocoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Editar Bloco</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`/api/blocos/${blocoEditando.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: nomeEditBloco }),
                  });
                  if (!response.ok) throw new Error('Erro ao editar bloco');
                  setEditModalOpen(false);
                  setBlocoEditando(null);
                  await fetchBlocos();
                } catch {
                  alert('Erro ao editar bloco');
                }
              }}
              className="space-y-4"
            >
              <input
                type="text"
                value={nomeEditBloco}
                onChange={(e) => setNomeEditBloco(e.target.value)}
                className="w-full input-style"
                placeholder="Nome do Bloco"
                required
              />
              <div className="flex gap-2 justify-end">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" onClick={() => setEditModalOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mt-8">
        <h2 className="text-2xl font-bold text-indigo-700 p-8 border-b mb-2">Blocos Existentes</h2>
        {isLoading && <p className="p-8">Carregando blocos...</p>}
        {!isLoading && blocos.length === 0 && !error && (
          <p className="p-8 text-gray-500">Nenhum bloco cadastrado ainda.</p>
        )}
        {!isLoading && blocos.length > 0 && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {blocos.map((bloco) => (
                <div key={bloco.id} className="flex flex-col justify-between h-full p-6 rounded-2xl shadow-lg border border-indigo-100 bg-white hover:shadow-2xl transition">
                  <div>
                    <p className="text-xl font-bold text-indigo-700">{bloco.nome}</p>
                    <p className="text-xs text-gray-400 mt-2">ID: {bloco.id}</p>
                    {bloco.salas && bloco.salas.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Salas: {bloco.salas.map(s => s.nome).join(', ')}</p>
                    )}
                    {bloco.salas && bloco.salas.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Nenhuma sala neste bloco.</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 justify-end">
                    <button
                      className="px-3 py-1 rounded-md border border-indigo-400 text-indigo-700 font-semibold hover:bg-indigo-50 transition"
                      onClick={() => {
                        setBlocoEditando(bloco);
                        setNomeEditBloco(bloco.nome);
                        setEditModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 rounded-md border border-red-400 text-red-700 font-semibold hover:bg-red-50 transition"
                      onClick={() => alert('Abrir modal de exclusão (implementar)')}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .input-style {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-width: 1px;
          border-color: #D1D5DB;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .input-style:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          --tw-ring-inset: var(--tw-empty,/*!*/ /*!*/);
          --tw-ring-offset-width: 0px;
          --tw-ring-offset-color: #fff;
          --tw-ring-color: #6366F1;
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
          border-color: #6366F1;
        }
      `}</style>
    </div>
  );
}