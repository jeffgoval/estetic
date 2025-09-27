import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { Spinner } from '../atoms/Spinner/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAnyPermission?: boolean; // Se true, precisa de qualquer uma das permissões. Se false, precisa de todas
  allowedRoles?: ('super_admin' | 'owner' | 'admin' | 'professional' | 'receptionist')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAnyPermission = false,
  allowedRoles = [],
  redirectTo = '/login',
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verificar permissões específicas
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAnyPermission
      ? hasAnyPermission(requiredPermissions as any)
      : hasAllPermissions(requiredPermissions as any);

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Permissão Insuficiente
            </h2>
            <p className="text-gray-600 mb-6">
              Você não tem as permissões necessárias para acessar esta funcionalidade.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};