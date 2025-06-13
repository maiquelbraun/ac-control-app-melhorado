import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const blocos = await prisma.bloco.findMany({
      orderBy: {
        nome: 'asc',
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: blocos,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar blocos:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao buscar blocos',
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