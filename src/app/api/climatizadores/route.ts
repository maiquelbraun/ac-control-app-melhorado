import { NextRequest, NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '@/lib/prisma';
import { withErrorHandler } from '@/lib/api/middleware';
import { AppError, ValidationError, NotFoundError } from '@/lib/errors';
import { isModoOperacao, isVelocidadeVentilador } from '@/types/climatizador';

interface CreateClimatizadorBody {
  nome: string;
  marca?: string;
  modelo?: string;
  salaId: string;
  dispositivoControleId: string;
  ligado?: boolean;
  temperaturaDesejada?: number;
  modoOperacao?: string;
  velocidadeVentilador?: string;
  statusOperacional?: string;
  ultimaManutencao?: Date;
  proximaManutencaoRecomendada?: Date;
}

export async function GET() {
  const climatizadores = await prisma.climatizador.findMany({
    include: {
      sala: {
        include: {
          bloco: true,
        },
      },
      dispositivoControle: true,
    },
  });

  if (!climatizadores || !Array.isArray(climatizadores)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Não foi possível buscar os climatizadores',
        error: 'CLIMATIZADOR_NOT_FOUND'
      },
      { status: 404 }
    );
  }

  // Map and validate the results
  const processedClimatizadores = climatizadores.map(climatizador => {
    const modoOperacao = climatizador.modoOperacao?.toUpperCase() || null;
    const velocidadeVentilador = climatizador.velocidadeVentilador?.toUpperCase() || null;

    // Validate enums
    if (modoOperacao && !isModoOperacao(modoOperacao)) {
      throw new Error(`Modo de operação inválido: ${modoOperacao}`);
    }
    if (velocidadeVentilador && !isVelocidadeVentilador(velocidadeVentilador)) {
      throw new Error(`Velocidade do ventilador inválida: ${velocidadeVentilador}`);
    }

    return {
      ...climatizador,
      modoOperacao,
      velocidadeVentilador
    };
  });

  return NextResponse.json(
    {
      success: true,
      data: processedClimatizadores
    },
    { status: 200 }
  );
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json() as CreateClimatizadorBody;

    if (!body.nome || !body.dispositivoControleId || !body.salaId) {
      throw new ValidationError(
        'Nome, ID do dispositivo de controle e ID da sala são obrigatórios.'
      );
    }

    const climatizador = await prisma.climatizador.create({
      data: {
        nome: body.nome,
        marca: body.marca,
        modelo: body.modelo,
        ligado: body.ligado ?? false,
        temperaturaDesejada: body.temperaturaDesejada,
        modoOperacao: body.modoOperacao?.toUpperCase(),
        velocidadeVentilador: body.velocidadeVentilador?.toUpperCase(),
        statusOperacional: body.statusOperacional?.toUpperCase() || 'OK',
        ultimaManutencao: body.ultimaManutencao,
        proximaManutencaoRecomendada: body.proximaManutencaoRecomendada,
        sala: { connect: { id: body.salaId } },
        dispositivoControle: { connect: { idEsp32: body.dispositivoControleId } },
      },
      include: {
        sala: { include: { bloco: true } },
        dispositivoControle: true,
      },
    });

    return NextResponse.json(
      { success: true, data: climatizador },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? error.code : 'UNKNOWN_CODE';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Erro detalhado ao criar climatizador:', {
      error,
      message: errorMessage,
      code: errorCode,
      stack: errorStack
    });

    // Handling Prisma-specific errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Sala ou dispositivo de controle não encontrado');
      } else if (error.code === 'P2002') {
        throw new ValidationError('Dispositivo de controle já está em uso');
      }
    }

    throw new AppError(
      'Erro ao criar climatizador',
      500,
      'CLIMATIZADOR_CREATE_ERROR'
    );
  }
});