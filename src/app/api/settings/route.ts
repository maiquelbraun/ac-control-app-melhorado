import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.configuracao.findFirst();

    // Se não existir configuração, retorna valores padrão
    const defaultSettings = {
      notificationsEnabled: true,
      temperatureRangeMin: 16,
      temperatureRangeMax: 30,
      maintenanceInterval: 30,
      mqttBroker: 'mqtt://localhost',
      mqttPort: '1883',
      mqttUsername: '',
      mqttPassword: '',
    };

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: settings || defaultSettings,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao buscar configurações',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica dos campos
    const validatedSettings = {
      notificationsEnabled: Boolean(body.notificationsEnabled),
      temperatureRangeMin: Math.max(16, Math.min(30, Number(body.temperatureRange[0]))),
      temperatureRangeMax: Math.max(16, Math.min(30, Number(body.temperatureRange[1]))),
      maintenanceInterval: Math.max(15, Math.min(90, Number(body.maintenanceInterval))),
      mqttBroker: String(body.mqttBroker),
      mqttPort: String(body.mqttPort),
      mqttUsername: String(body.mqttUsername),
      mqttPassword: String(body.mqttPassword),
    };

    // Atualiza ou cria as configurações
    const settings = await prisma.configuracao.upsert({
      where: {
        id: 1, // Assumindo que sempre teremos apenas um registro de configuração
      },
      update: validatedSettings,
      create: {
        id: 1,
        ...validatedSettings,
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: settings,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Erro ao salvar configurações',
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