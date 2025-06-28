'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'

// Função auxiliar para obter parâmetros da URL
function getQueryParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const [callbackUrl, setCallbackUrl] = useState('/');

  useEffect(() => {
    setCallbackUrl(getQueryParam('callbackUrl') || '/');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Tentando fazer login com:', { email, password, callbackUrl });

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    console.log('Resultado completo do signIn:', result);

    if (result?.ok) {
      console.log('Login bem-sucedido, aguardando sessão...');
      const session = await getSession();
      if (session) {
        console.log('Sessão carregada, redirecionando para:', callbackUrl);
        window.location.href = callbackUrl;
      } else {
        console.error('Sessão não carregada após login bem-sucedido.');
        setError('Erro ao carregar sessão após login.');
      }
    } else if (result?.error) {
      console.error('Erro no login:', result.error);
      setError('Email ou senha inválidos.');
    } else {
      console.log('Resultado do signIn não é ok nem erro, assumindo falha.');
      setError('Ocorreu um erro desconhecido ao tentar fazer login.');
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <LockOutlined sx={{ m: 1, bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: '50%' }} />
            <Typography component="h1" variant="h4" gutterBottom>
              AC Control App
            </Typography>
            <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
              Faça login para continuar
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Entrar'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

