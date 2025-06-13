import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sala = await prisma.sala.update({
      where: { id: params.id },
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
      JSON.stringify({ success: true, data: sala }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Erro ao atualizar sala:', error);

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
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

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Erro ao atualizar sala.",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se existem climatizadores associados
    const sala = await prisma.sala.findUnique({
      where: { id: params.id },
      include: {
        climatizadores: true,
      },
    });

    if (!sala) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Sala não encontrada.",
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (sala.climatizadores.length > 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Não é possível excluir uma sala que possui climatizadores.",
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await prisma.sala.delete({
      where: { id: params.id },
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao excluir sala:', error);

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Erro ao excluir sala.",
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