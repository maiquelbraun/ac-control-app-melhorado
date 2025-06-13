import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const { nome, marca, modelo } = body;

    if (!nome) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Nome é obrigatório',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const climatizador = await prisma.climatizador.update({
      where: { id },
      data: {
        nome,
        marca,
        modelo,
      },
      include: {
        sala: {
          include: {
            bloco: true,
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: climatizador,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao atualizar climatizador:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao atualizar climatizador',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.climatizador.delete({
      where: { id },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao excluir climatizador:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao excluir climatizador',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}