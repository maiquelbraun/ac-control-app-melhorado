import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions)

      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        )
      }

      // Verificar se o usuário tem o role necessário
      if (requiredRoles && !requiredRoles.includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Acesso negado' },
          { status: 403 }
        )
      }

      return handler(req, session)
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

export function requireAuth(requiredRoles?: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = withAuth(originalMethod, requiredRoles)

    return descriptor
  }
}

