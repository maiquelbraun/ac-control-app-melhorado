import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar apenas dispositivos que não estão associados a climatizadores
    const dispositivosDisponiveis = await prisma.dispositivoControle.findMany({
      where: {
        climatizador: null, // Apenas dispositivos sem climatizador associado
      },
      select: {
        idEsp32: true,
        modeloEsp32: true,
        online: true,
      },
      orderBy: {
        idEsp32: 'asc',
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: dispositivosDisponiveis,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar dispositivos de controle:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao buscar dispositivos de controle',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Rota para adicionar novo dispositivo (usado para testes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idEsp32, modeloEsp32 } = body;

    if (!idEsp32) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'ID do ESP32 é obrigatório',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const dispositivo = await prisma.dispositivoControle.create({
      data: {
        idEsp32,
        modeloEsp32,
        online: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: dispositivo,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Erro ao criar dispositivo de controle:', error);
    
    // Erro de chave única (ID já existe)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Já existe um dispositivo com este ID',
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao criar dispositivo de controle',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}