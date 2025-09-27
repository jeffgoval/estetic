import React, { useState } from 'react';
import { Link } from 'react-router';
import { nhost } from '../../config/nhost';
import { Button } from '../atoms/Button/Button';
import { Input } from '../atoms/Input/Input';
import { Spinner } from '../atoms/Spinner/Spinner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await nhost.auth.resetPassword({
        email,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage('Instruções para redefinir sua senha foram enviadas para seu email.');
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      setError(error.message || 'Erro ao solicitar redefinição de senha');
    } finally {
      setIsLoading(false);
    }
  };

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
                d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2m0 0H9a2 2 0 00-2 2v2m0 0V9a2 2 0 012 2m0 0a2 2 0 002 2"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email para receber instruções de redefinição
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Enviando...
                </div>
              ) : (
                'Enviar instruções'
              )}
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};