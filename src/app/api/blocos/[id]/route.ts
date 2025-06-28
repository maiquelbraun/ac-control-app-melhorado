// ac-control-app/src/app/api/blocos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PUT /api/blocos/:id
 * Atualiza o nome de um bloco específico pelo seu ID.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = context.params;
  try {
    const body = await request.json();
    if (!body.nome || typeof body.nome !== 'string') {
      return NextResponse.json({ message: "Nome do bloco é obrigatório." }, { status: 400 });
    }
    const blocoAtualizado = await prisma.bloco.update({
      where: { id },
      data: { nome: body.nome },
    });
    return NextResponse.json(blocoAtualizado, { status: 200 });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: "Bloco não encontrado." }, { status: 404 });
    }
    console.error(`Erro ao editar bloco ${id}:`, error);
    return NextResponse.json({ message: "Erro interno do servidor ao editar bloco.", error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}