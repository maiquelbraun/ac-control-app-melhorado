export interface DispositivoControle {
  id: string;
  idEsp32: string;
  statusOperacional: string;
  ultimaAtualizacao: Date | null;
  climatizadorId: string | null;
}

export interface Climatizador {
  id: string;
  nome: string;
  marca?: string;
  modelo?: string;
  statusOperacional: string;
  ligado: boolean;
  temperaturaDesejada: number;
  modoOperacao: string;
  velocidadeVentilador: string;
  dispositivoControleId: string | null;
  salaId: string | null;
}

export interface DispositivoStatus {
  id: string;
  idEsp32: string;
  statusOperacional: string;
  ultimaAtualizacao: Date | null;
  associado: boolean;
  climatizadorId: string | null;
}

export interface DispositivoDb extends DispositivoControle {
  climatizador: Climatizador | null;
}