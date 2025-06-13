import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, blocoId } = body;

    if (!nome || !blocoId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Nome da sala e ID do bloco são obrigatórios.",
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const sala = await prisma.sala.create({
      data: {
        nome,
        bloco: {
          connect: { id: blocoId },
        },
      },
      include: {
        bloco: true,
        climatizadores: {
          select: {
            id: true,
            nome: true,
            statusOperacional: true,
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: sala,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Erro ao criar sala:', error);

    // Erro de chave única (nome da sala + blocoId)
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Já existe uma sala com este nome neste bloco.",
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Bloco não encontrado
      if (error.code === 'P2025') {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Bloco não encontrado.",
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Erro ao criar sala.",
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
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

export async function GET() {
  try {
    const salas = await prisma.sala.findMany({
      include: {
        bloco: true,
        climatizadores: {
          select: {
            id: true,
            nome: true,
            statusOperacional: true,
          },
        },
      },
      orderBy: [
        { bloco: { nome: 'asc' } },
        { nome: 'asc' },
      ],
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: salas,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao buscar salas',
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