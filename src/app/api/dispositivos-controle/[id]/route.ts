import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const { modeloEsp32 } = body;

    const dispositivo = await prisma.dispositivoControle.update({
      where: { idEsp32: id },
      data: {
        modeloEsp32,
      },
      include: {
        climatizador: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: dispositivo,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao atualizar dispositivo:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao atualizar dispositivo',
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
    // Verificar se o dispositivo está associado a um climatizador
    const dispositivo = await prisma.dispositivoControle.findUnique({
      where: { idEsp32: id },
      include: {
        climatizador: true,
      },
    });

    if (!dispositivo) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Dispositivo não encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (dispositivo.climatizador) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Não é possível excluir um dispositivo associado a um climatizador',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Excluir o dispositivo
    await prisma.dispositivoControle.delete({
      where: { idEsp32: id },
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
    console.error('Erro ao excluir dispositivo:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao excluir dispositivo',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}