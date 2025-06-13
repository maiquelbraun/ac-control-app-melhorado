// Tipos básicos
export type ModoOperacao = 'REFRIGERAR' | 'VENTILAR' | 'AUTOMATICO' | 'DESUMIDIFICAR';
export type VelocidadeVentilador = 'BAIXA' | 'MEDIA' | 'ALTA' | 'AUTOMATICO';
export type Comando = 'LIGAR' | 'DESLIGAR' | 'TEMPERATURA' | 'MODO_OPERACAO' | 'VELOCIDADE';

// Funções de validação
export const isModoOperacao = (value: unknown): value is ModoOperacao => {
  return typeof value === 'string' && ['REFRIGERAR', 'VENTILAR', 'AUTOMATICO', 'DESUMIDIFICAR'].includes(value);
};

export const isVelocidadeVentilador = (value: unknown): value is VelocidadeVentilador => {
  return typeof value === 'string' && ['BAIXA', 'MEDIA', 'ALTA', 'AUTOMATICO'].includes(value);
};

export interface ComandoClimatizador {
  comando: Comando;
  valor?: number | ModoOperacao | VelocidadeVentilador;
}

// Interface base com campos obrigatórios
interface ClimatizadorBase {
  id: string;
  nome: string;
  ligado: boolean;
  statusOperacional: string;
  salaId: string;
  dispositivoControleId: string;
  ultimaAtualizacao: Date;
}

// Interface do Prisma (banco de dados)
export interface ClimatizadorPrisma extends ClimatizadorBase {
  marca: string | null;
  modelo: string | null;
  temperaturaDesejada: number | null;
  temperaturaAtual: number | null;
  umidadeAtual: number | null;
  modoOperacao: string | null;
  velocidadeVentilador: string | null;
  ultimaManutencao: Date | null;
  proximaManutencaoRecomendada: Date | null;
}

// Interface para a API
export interface Climatizador extends ClimatizadorBase {
  marca: string | null;
  modelo: string | null;
  temperaturaDesejada: number | null;
  temperaturaAtual: number | null;
  umidadeAtual: number | null;
  modoOperacao: ModoOperacao | null;
  velocidadeVentilador: VelocidadeVentilador | null;
  ultimaManutencao: Date | null;
  proximaManutencaoRecomendada: Date | null;
}

// Interface para UI
export interface ClimatizadorUI extends ClimatizadorBase {
  marca: string | null;
  modelo: string | null;
  temperaturaDesejada: number | null;
  temperaturaAtual: number | null;
  umidadeAtual: number | null;
  modoOperacao: ModoOperacao | null;
  velocidadeVentilador: VelocidadeVentilador | null;
  ultimaManutencao: Date | null;
  proximaManutencaoRecomendada: Date | null;
}

// Interface com relações expandidas
export interface ClimatizadorComRelacoes extends Climatizador {
  sala: {
    id: string;
    nome: string;
    bloco: {
      id: string;
      nome: string;
    };
  };
}

// Conversores
export const toClimatizador = (prisma: ClimatizadorPrisma): Climatizador => ({
  ...prisma,
  modoOperacao: isModoOperacao(prisma.modoOperacao) ? prisma.modoOperacao : null,
  velocidadeVentilador: isVelocidadeVentilador(prisma.velocidadeVentilador) ? prisma.velocidadeVentilador : null
});

export const toClimatizadorUI = (db: ClimatizadorPrisma | Climatizador): ClimatizadorUI => {
  const base: ClimatizadorBase = {
    id: db.id,
    nome: db.nome,
    ligado: db.ligado,
    statusOperacional: db.statusOperacional,
    salaId: db.salaId,
    dispositivoControleId: db.dispositivoControleId,
    ultimaAtualizacao: db.ultimaAtualizacao
  };

  return {
    ...base,
    marca: db.marca,
    modelo: db.modelo,
    temperaturaDesejada: db.temperaturaDesejada,
    temperaturaAtual: db.temperaturaAtual,
    umidadeAtual: db.umidadeAtual,
    modoOperacao: (db.modoOperacao && isModoOperacao(db.modoOperacao)) ? db.modoOperacao : null,
    velocidadeVentilador: (db.velocidadeVentilador && isVelocidadeVentilador(db.velocidadeVentilador)) ? db.velocidadeVentilador : null,
    ultimaManutencao: db.ultimaManutencao,
    proximaManutencaoRecomendada: db.proximaManutencaoRecomendada
  };
};