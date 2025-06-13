import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface DispositivoGroup {
  online: boolean;
  _count: number;
}

export async function GET() {
  try {
    // Buscando todas as contagens em paralelo
    const [
      totalSalas,
      totalClimatizadores,
      climatizadoresLigados,
      dispositivos,
      temperaturaMedia
    ] = await Promise.all([
      prisma.sala.count(),
      prisma.climatizador.count(),
      prisma.climatizador.count({
        where: {
          ligado: true
        }
      }),
      prisma.dispositivoControle.groupBy({
        by: ['online'],
        _count: true
      }),
      prisma.climatizador.aggregate({
        _avg: {
          temperaturaDesejada: true
        },
        where: {
          temperaturaDesejada: {
            not: null
          }
        }
      })
    ]);

    // Calculando total de dispositivos online/offline
    const totalDispositivos = dispositivos.reduce((acc: number, curr: DispositivoGroup) => acc + curr._count, 0);
    const dispositivosOnline = dispositivos.find((d: DispositivoGroup) => d.online)?._count || 0;

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          totalSalas,
          totalClimatizadores,
          climatizadoresLigados,
          dispositivos: {
            total: totalDispositivos,
            online: dispositivosOnline
          },
          temperaturaMedia: temperaturaMedia._avg.temperaturaDesejada || 23 // valor padrão se não houver dados
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao buscar estatísticas do dashboard'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}