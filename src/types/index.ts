// ac-control-app/src/types/index.ts

/**
 * Representa os dados de leitura dos sensores do dispositivo de controle.
 */
export interface LeituraSensor {
  id?: string; // Opcional, pode ser gerado pelo banco de dados
  climatizadorId: string; // ID do climatizador ao qual esta leitura pertence
  timestamp: Date;
  corrente?: number; // Em Amperes
  tensao?: number; // Em Volts
  potenciaAparente?: number; // Em Volt-Amperes (VA), pode ser calculado (tensao * corrente)
  temperaturaAmbiente?: number; // Em Celsius, se disponível
  umidadeAmbiente?: number; // Em %, se disponível
}

/**
 * Representa o dispositivo de controle (ESP32 e seus periféricos) associado a um climatizador.
 */
export interface DispositivoControle {
  idEsp32: string; // MAC Address ou outro identificador único do ESP32
  modeloEsp32?: string; // Ex: "ESP32-WROOM-32"
  firmwareVersion?: string;
  online: boolean; // Indica se o dispositivo está atualmente conectado/online
  ultimoContato?: Date; // Data do último contato/heartbeat
  // Status dos periféricos
  emissorIrOk: boolean;
  sensorCorrenteOk: boolean;
  sensorTensaoOk: boolean;
}

/**
 * Representa um climatizador (ar condicionado).
 */
export interface Climatizador {
  id: string; // Identificador único do climatizador (gerado pelo sistema ou MAC do ESP)
  nome: string; // Nome amigável dado pelo usuário (ex: "AC Sala Reuniões")
  localizacao?: string; // Descrição da localização (ex: "Bloco A, Sala 101")
  marca?: string;
  modelo?: string;
  // Configurações de controle
  ligado: boolean; // Estado atual (ligado/desligado)
  temperaturaDesejada?: number; // Em Celsius
  modoOperacao?: 'auto' | 'refrigerar' | 'aquecer' | 'ventilar' | 'desumidificar';
  velocidadeVentilador?: 'auto' | 'baixa' | 'media' | 'alta';
  // Associação com o dispositivo de controle
  dispositivoControleId: string; // Referência ao ID do DispositivoControle (idEsp32)
  // Dados de status e manutenção
  statusOperacional: 'ok' | 'requer_atencao' | 'em_manutencao' | 'offline';
  ultimaManutencao?: Date;
  proximaManutencaoRecomendada?: Date;
  alertas?: string[]; // Lista de alertas ativos
  // Relacionamentos (opcional, dependendo da modelagem do banco)
  // dispositivo?: DispositivoControle; // Poderia ser populado em queries específicas
  // ultimasLeituras?: LeituraSensor[]; // Poderia ser populado em queries específicas
}

/**
 * Representa um comando a ser enviado para o climatizador via ESP32.
 */
export interface ComandoClimatizador {
  climatizadorId: string;
  acao: 'ligar' | 'desligar' | 'set_temperatura' | 'set_modo' | 'set_velocidade';
  valor?: string | number; // Ex: 22 para temperatura, 'refrigerar' para modo
  timestampEnvio: Date;
  status: 'pendente' | 'enviado' | 'confirmado' | 'falhou';
  respostaEsp32?: string; // Resposta do ESP32 ao comando
}