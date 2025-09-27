import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../atoms/Button/Button';
import { Input } from '../atoms/Input/Input';
import { Spinner } from '../atoms/Spinner/Spinner';

export const LoginPage: React.FC = () => {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  // Redirecionar se já estiver autenticado
  if (user && !isLoading) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    try {
      setIsSigningIn(true);
      
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Gestão Clínica
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Crie sua conta para começar' : 'Faça login para acessar sua clínica'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && (
              <Input
                label="Nome completo"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome completo"
                required={isSignUp}
              />
            )}
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSigningIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </div>
              ) : (
                isSignUp ? 'Criar conta' : 'Entrar'
              )}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-500 text-sm block w-full"
            >
              {isSignUp 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem uma conta? Cadastre-se'
              }
            </button>
            
            {!isSignUp && (
              <a
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-500 text-sm block"
              >
                Esqueceu sua senha?
              </a>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ao {isSignUp ? 'criar uma conta' : 'fazer login'}, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Política de Privacidade
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};