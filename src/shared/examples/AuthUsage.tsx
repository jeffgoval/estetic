import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '../providers/AuthProvider';
import { ProtectedRoute, LoginPage, ForgotPasswordPage, TenantSwitcher } from '../components/auth';
import { useAuth, usePermissions, useTenant } from '../hooks/auth';
import { Button } from '../components/atoms/Button/Button';

// Exemplo de componente que usa autenticação
const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { canManageUsers, canViewReports, isOwner } = usePermissions();
  const { currentTenant } = useTenant();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo, {user?.displayName || user?.email}
          </p>
          {currentTenant && (
            <p className="text-sm text-gray-500">
              Clínica: {currentTenant.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <TenantSwitcher />
          <Button onClick={signOut} variant="outline">
            Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Informações do Usuário</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Tenant ID:</strong> {user?.tenantId}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Permissões</h3>
          <ul className="space-y-1">
            <li>Gerenciar usuários: {canManageUsers ? '✅' : '❌'}</li>
            <li>Ver relatórios: {canViewReports ? '✅' : '❌'}</li>
            <li>É proprietário: {isOwner ? '✅' : '❌'}</li>
          </ul>
        </div>

        {currentTenant && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Informações da Clínica</h3>
            <p><strong>Nome:</strong> {currentTenant.name}</p>
            <p><strong>Status:</strong> {currentTenant.subscriptionStatus}</p>
            <div className="flex items-center mt-2">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: currentTenant.primaryColor }}
              />
              <span>Cor primária</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Exemplo de página que requer permissões específicas
const UsersPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
      <p>Esta página só é acessível para usuários com permissão de gerenciar usuários.</p>
    </div>
  );
};

// Exemplo de aplicação completa com autenticação
export const AuthExampleApp: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute 
                requiredPermissions={['manage_users']}
                allowedRoles={['owner', 'admin']}
              >
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

// Exemplo de hook personalizado que combina autenticação e permissões
export const useAuthGuard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();

  const requireAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }
  };

  const requirePermission = (permission: string) => {
    requireAuth();
    if (!hasPermission(permission as any)) {
      throw new Error(`Permissão necessária: ${permission}`);
    }
  };

  const requireAnyPermission = (permissions: string[]) => {
    requireAuth();
    if (!hasAnyPermission(permissions as any)) {
      throw new Error(`Uma das seguintes permissões é necessária: ${permissions.join(', ')}`);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    requireAuth,
    requirePermission,
    requireAnyPermission,
  };
};