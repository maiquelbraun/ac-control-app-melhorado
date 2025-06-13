import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignInPage from '@/app/auth/signin/page'

// Mock das dependências
jest.mock('next-auth/react')
jest.mock('next/navigation')

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockGet = jest.fn()

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
  })
  
  ;(useSearchParams as jest.Mock).mockReturnValue({
    get: mockGet,
  })
})

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockReturnValue(null)
  })

  it('deve renderizar o formulário de login', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('AC Control App')).toBeInTheDocument()
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('deve mostrar erro quando credenciais são inválidas', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })
    
    render(<SignInPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'wrongpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    
    await waitFor(() => {
      expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument()
    })
  })

  it('deve redirecionar após login bem-sucedido', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    mockGet.mockReturnValue('/dashboard')
    
    render(<SignInPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password',
        redirect: false,
      })
    })
  })

  it('deve mostrar alerta quando usuário está inativo', () => {
    mockGet.mockImplementation((param) => {
      if (param === 'error') return 'inactive'
      return null
    })
    
    render(<SignInPage />)
    
    expect(screen.getByText('Sua conta está inativa. Entre em contato com o administrador.')).toBeInTheDocument()
  })

  it('deve desabilitar o formulário durante o carregamento', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<SignInPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Senha')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

