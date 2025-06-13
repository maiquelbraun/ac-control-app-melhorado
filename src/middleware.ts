import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
  const isPublicApiRoute = request.nextUrl.pathname === "/api/health"

  // Permitir rotas de autenticação e saúde
  if (isAuthPage || isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Redirecionar para login se não autenticado
  if (!token) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Verificar se o usuário está ativo
  if (!token.active) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("error", "inactive")
    return NextResponse.redirect(url)
  }

  // Controle de acesso baseado em roles
  const userRole = token.role as string
  const pathname = request.nextUrl.pathname

  // Rotas que requerem role ADMIN
  const adminRoutes = [
    "/gerenciamento/dispositivos",
    "/settings",
    "/api/dispositivos-controle",
    "/api/settings",
  ]

  // Rotas que requerem role OPERADOR ou superior
  const operatorRoutes = [
    "/gerenciamento",
    "/api/climatizadores",
    "/api/blocos",
    "/api/salas",
  ]

  // Verificar acesso para rotas administrativas
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Verificar acesso para rotas de operação
  if (operatorRoutes.some(route => pathname.startsWith(route))) {
    if (!["ADMIN", "OPERADOR"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

