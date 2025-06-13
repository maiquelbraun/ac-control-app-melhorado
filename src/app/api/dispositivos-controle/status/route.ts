import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { DispositivoStatus, DispositivoDb } from '@/types/dispositivo';

export async function GET() {
  try {
    // Buscar todos os dispositivos de controle
    const dispositivos = await prisma.dispositivoControle.findMany({
      include: {
        climatizador: true,
      },
    }) as DispositivoDb[];

    // Formatar dados para retorno
    const dispositivosFormatados: DispositivoStatus[] = dispositivos.map((dispositivo) => ({
      id: dispositivo.id,
      idEsp32: dispositivo.idEsp32,
      statusOperacional: dispositivo.statusOperacional,
      ultimaAtualizacao: dispositivo.ultimaAtualizacao,
      associado: !!dispositivo.climatizador,
      climatizadorId: dispositivo.climatizador?.id || null,
    }));

    // Ordenar por data de atualização (mais recentes primeiro)
    dispositivosFormatados.sort((a, b) => 
      (b.ultimaAtualizacao?.getTime() || 0) - (a.ultimaAtualizacao?.getTime() || 0)
    );

    return NextResponse.json({
      success: true,
      data: dispositivosFormatados,
    });
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao buscar dispositivos',
      },
      { status: 500 }
    );
  }
}