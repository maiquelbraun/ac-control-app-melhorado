import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Mock das dependências
jest.mock('@/lib/prisma')
jest.mock('bcryptjs')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockHash = hash as jest.MockedFunction<typeof hash>

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve criar um usuário com sucesso', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'OPERADOR'
    }

    const hashedPassword = 'hashedpassword123'
    const createdUser = {
      id: '1',
      email: userData.email,
      name: userData.name,
      role: userData.role,
      active: true,
      createdAt: new Date(),
    }

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockHash.mockResolvedValue(hashedPassword)
    mockPrisma.user.create.mockResolvedValue(createdUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(201)
    expect(responseData.message).toBe('Usuário criado com sucesso')
    expect(responseData.user).toEqual(createdUser)
    expect(mockHash).toHaveBeenCalledWith(userData.password, 12)
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      }
    })
  })

  it('deve retornar erro quando email já existe', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
    }

    const existingUser = {
      id: '1',
      email: userData.email,
      password: 'hashedpassword',
      role: 'VISUALIZADOR',
    }

    mockPrisma.user.findUnique.mockResolvedValue(existingUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(409)
    expect(responseData.error).toBe('Usuário já existe')
    expect(mockPrisma.user.create).not.toHaveBeenCalled()
  })

  it('deve retornar erro quando email não é fornecido', async () => {
    const userData = {
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toBe('Email e senha são obrigatórios')
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('deve retornar erro quando senha não é fornecida', async () => {
    const userData = {
      email: 'test@example.com',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.error).toBe('Email e senha são obrigatórios')
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('deve usar role padrão quando não especificado', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    }

    const hashedPassword = 'hashedpassword123'
    const createdUser = {
      id: '1',
      email: userData.email,
      name: userData.name,
      role: 'VISUALIZADOR',
      active: true,
      createdAt: new Date(),
    }

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockHash.mockResolvedValue(hashedPassword)
    mockPrisma.user.create.mockResolvedValue(createdUser as any)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(201)
    expect(responseData.user.role).toBe('VISUALIZADOR')
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: 'VISUALIZADOR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      }
    })
  })
})

