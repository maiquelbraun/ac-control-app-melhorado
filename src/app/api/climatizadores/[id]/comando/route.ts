import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  ComandoClimatizador,
  Climatizador,
  ClimatizadorComRelacoes,
  ModoOperacao,
  VelocidadeVentilador,
  isModoOperacao,
  isVelocidadeVentilador
} from '@/types/climatizador';
import { publishToMqtt } from '@/services/mqtt';
import { logger } from '@/lib/logger';


const validateTemperature = (temp: unknown): temp is number => {
  return typeof temp === 'number' && temp >= 16 && temp <= 30;
};

const validateOperationMode = (mode: unknown): mode is ModoOperacao => {
  return typeof mode === 'string' && ['REFRIGERAR', 'VENTILAR', 'AUTOMATICO', 'DESUMIDIFICAR'].includes(mode);
};

const validateFanSpeed = (speed: unknown): speed is VelocidadeVentilador => {
  return typeof speed === 'string' && ['BAIXA', 'MEDIA', 'ALTA', 'AUTOMATICO'].includes(speed);
};

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  executionTime?: number;
  error?: string;
}

type ApiSuccessResponse = ApiResponse<ClimatizadorComRelacoes>;
type ApiErrorResponse = ApiResponse<never>;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const startTime = Date.now();
    const comando = await request.json() as ComandoClimatizador;
    logger.info(`Comando recebido para climatizador ${id}:`, comando);

    // Validar o climatizador e dispositivo
    const climatizador = await prisma.climatizador.findUnique({
      where: { id },
      include: {
        dispositivoControle: true
      }
    });

    if (!climatizador) {
      logger.warn(`Climatizador ${id} não encontrado`);
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Climatizador não encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar se o dispositivo está online
    if (!climatizador.dispositivoControle?.online) {
      logger.error(`Dispositivo ${climatizador.dispositivoControleId} offline`);
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Dispositivo de controle offline',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Executar o comando específico
    const updateData: Partial<Climatizador> = {};
    const mqttPayload: {
      command: string;
      value?: number | string;
    } = { command: comando.comando };

    switch (comando.comando) {
      case 'LIGAR':
        updateData.ligado = true;
        break;

      case 'DESLIGAR':
        updateData.ligado = false;
        break;

      case 'TEMPERATURA':
        if (!validateTemperature(comando.valor)) {
          logger.warn(`Temperatura inválida: ${comando.valor}`);
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: 'Temperatura inválida',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        updateData.temperaturaDesejada = comando.valor;
        mqttPayload.value = comando.valor;
        break;

      case 'MODO_OPERACAO':
        if (!validateOperationMode(comando.valor)) {
          logger.warn(`Modo de operação inválido: ${comando.valor}`);
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: 'Modo de operação inválido',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        updateData.modoOperacao = comando.valor;
        mqttPayload.value = comando.valor;
        break;

      case 'VELOCIDADE':
        if (!validateFanSpeed(comando.valor)) {
          logger.warn(`Velocidade inválida: ${comando.valor}`);
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: 'Velocidade inválida',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        updateData.velocidadeVentilador = comando.valor;
        mqttPayload.value = comando.valor;
        break;

      default:
        logger.warn(`Comando inválido: ${comando.comando}`);
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'Comando inválido',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }

    // Publicar comando no MQTT
    try {
      await publishToMqtt(
        `climatizador/${climatizador.dispositivoControleId}/comando`,
        JSON.stringify(mqttPayload)
      );
    } catch (error) {
      logger.error('Erro ao publicar comando MQTT:', error);
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Erro ao enviar comando para o dispositivo',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Atualizar o banco de dados
    await prisma.climatizador.update({
      where: { id },
      data: {
        ...updateData,
        ultimaAtualizacao: new Date()
      },
    });

    const executionTime = Date.now() - startTime;
    logger.info(`Comando executado em ${executionTime}ms`);

    // Buscar climatizador atualizado
    const climatizadorAtualizado = await prisma.climatizador.findUnique({
      where: { id },
      include: {
        sala: {
          include: {
            bloco: true,
          },
        },
      },
    });

    const climatizadorUI: ClimatizadorComRelacoes | undefined = climatizadorAtualizado ? {
      id: climatizadorAtualizado.id,
      nome: climatizadorAtualizado.nome,
      ligado: climatizadorAtualizado.ligado,
      statusOperacional: climatizadorAtualizado.statusOperacional,
      salaId: climatizadorAtualizado.salaId,
      dispositivoControleId: climatizadorAtualizado.dispositivoControleId,
      ultimaAtualizacao: climatizadorAtualizado.ultimaAtualizacao,
      marca: climatizadorAtualizado.marca,
      modelo: climatizadorAtualizado.modelo,
      temperaturaDesejada: climatizadorAtualizado.temperaturaDesejada,
      temperaturaAtual: climatizadorAtualizado.temperaturaAtual,
      umidadeAtual: climatizadorAtualizado.umidadeAtual,
      modoOperacao: (climatizadorAtualizado.modoOperacao && isModoOperacao(climatizadorAtualizado.modoOperacao)) ? climatizadorAtualizado.modoOperacao : null,
      velocidadeVentilador: (climatizadorAtualizado.velocidadeVentilador && isVelocidadeVentilador(climatizadorAtualizado.velocidadeVentilador)) ? climatizadorAtualizado.velocidadeVentilador : null,
      ultimaManutencao: climatizadorAtualizado.ultimaManutencao,
      proximaManutencaoRecomendada: climatizadorAtualizado.proximaManutencaoRecomendada,
      sala: {
        id: climatizadorAtualizado.sala.id,
        nome: climatizadorAtualizado.sala.nome,
        bloco: {
          id: climatizadorAtualizado.sala.bloco.id,
          nome: climatizadorAtualizado.sala.bloco.nome
        }
      }
    } : undefined;

    const response: ApiSuccessResponse = {
      success: true,
      data: climatizadorUI,
      executionTime
    };

    return new NextResponse(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('Erro ao executar comando:', error);
    
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Erro interno ao processar comando',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    };

    return new NextResponse(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}