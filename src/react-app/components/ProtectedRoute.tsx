import { ReactNode, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { usePermissions } from '@/react-app/hooks/usePermissions';
import { Permission } from '@/shared/permissions';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';


interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermissions, 
  requireAll = false,
  fallback 
}: ProtectedRouteProps) {
  const { user, isPending } = useAuth();
  const { userRole, hasPermission, hasAnyPermission } = usePermissions();
  const navigate = useNavigate();

  // Always call useEffect at the top level
  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  // If authentication is still pending, show loading screen
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting to prevent flash of content
  if (!user) {
    return null;
  }

  // If no user role after authentication is complete, show access denied
  if (!userRole) {
    return fallback || <AccessDenied message="Acesso não autorizado. Role do usuário não encontrado. Tente fazer logout e login novamente." />;
  }

  // Check permissions based on requireAll flag
  const hasAccess = requireAll 
    ? requiredPermissions.every(permission => hasPermission(permission))
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return fallback || <AccessDenied message={`Você não tem permissão para acessar esta funcionalidade. Role atual: ${userRole}. Permissões necessárias: ${requiredPermissions.join(', ')}.`} />;
  }

  return <>{children}</>;
}

interface AccessDeniedProps {
  message?: string;
}

function AccessDenied({ message = "Acesso negado" }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

// Component for conditionally rendering UI elements based on permissions
interface PermissionGateProps {
  children: ReactNode;
  requiredPermissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  children, 
  requiredPermissions, 
  requireAll = false,
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const hasAccess = requireAll 
    ? requiredPermissions.every(permission => hasPermission(permission))
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
