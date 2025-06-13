export interface Bloco {
  id: string;
  nome: string;
}

export interface Sala {
  id: string;
  nome: string;
  blocoId: string;
  bloco: {
    id: string;
    nome: string;
  };
  climatizadores: {
    id: string;
    nome: string;
    statusOperacional: string;
  }[];
}

export interface SalaInput {
  id?: string;
  nome: string;
  blocoId: string;
}