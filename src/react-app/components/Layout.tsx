import { ReactNode } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from '@/react-app/hooks/useTheme';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Smile,
  Menu,
  X,
  Clock,
  Package,
  MessageSquare,
  Bot,
  FileText,
  Shield,
  Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/react-app/hooks/usePermissions';
import { PERMISSIONS, getRoleLabel } from '@/shared/permissions';
import type { Permission } from '@/shared/permissions';


interface LayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permissions: Permission[];
  requireAll?: boolean;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { userRole, hasAnyPermission, isSuperAdmin } = usePermissions();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/');
    }
  };

  const allNavigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3, 
      permissions: [PERMISSIONS.DASHBOARD_VIEW] 
    },
    { 
      name: 'Agenda', 
      href: '/agenda', 
      icon: Calendar, 
      permissions: [PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN] 
    },
    { 
      name: 'Lista de Espera', 
      href: '/lista-espera', 
      icon: Clock, 
      permissions: [PERMISSIONS.WAITING_LIST_VIEW] 
    },
    { 
      name: 'Procedimentos', 
      href: '/procedimentos', 
      icon: FileText, 
      permissions: [PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN] 
    },
    { 
      name: 'Pacientes', 
      href: '/pacientes', 
      icon: Users, 
      permissions: [PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.PATIENT_VIEW_OWN] 
    },
    { 
      name: 'Anamnese Digital', 
      href: '/anamnese', 
      icon: Stethoscope, 
      permissions: [PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.PATIENT_VIEW_OWN] 
    },
    { 
      name: 'Profissionais', 
      href: '/profissionais', 
      icon: UserCheck, 
      permissions: [PERMISSIONS.PROFESSIONAL_VIEW_ALL] 
    },
    { 
      name: 'Estoque', 
      href: '/estoque', 
      icon: Package, 
      permissions: [PERMISSIONS.INVENTORY_VIEW] 
    },
    { 
      name: 'WhatsApp', 
      href: '/whatsapp', 
      icon: MessageSquare, 
      permissions: [PERMISSIONS.WHATSAPP_VIEW] 
    },
    { 
      name: 'Agente IA', 
      href: '/agente-ia', 
      icon: Bot, 
      permissions: [PERMISSIONS.AI_AGENT_VIEW] 
    },
    { 
      name: 'Relatórios', 
      href: '/relatorios', 
      icon: FileText, 
      permissions: [PERMISSIONS.REPORTS_VIEW_ALL, PERMISSIONS.REPORTS_VIEW_OWN] 
    },
    { 
      name: 'Super Admin', 
      href: '/super-admin', 
      icon: Shield, 
      permissions: [PERMISSIONS.SUPER_ADMIN_ACCESS] 
    },
    { 
      name: 'Configurações', 
      href: '/configuracoes', 
      icon: Settings, 
      permissions: [PERMISSIONS.SETTINGS_VIEW] 
    },
  ];

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => 
    hasAnyPermission(item.permissions)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: theme ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` : 'linear-gradient(135deg, #3B82F6, #10B981)'
                }}
              >
                <Smile className="w-5 h-5 text-white" />
              </div>
              <span 
                className="text-xl font-bold"
                style={{ 
                  background: theme ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` : 'linear-gradient(135deg, #3B82F6, #10B981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {theme?.clinic_name || 'Suavizar'}
              </span>
            </div>
            <button
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={isActive ? {
                    background: theme ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` : 'linear-gradient(135deg, #3B82F6, #10B981)',
                    boxShadow: theme ? `0 10px 25px ${theme.primary_color}40` : '0 10px 25px #3B82F640'
                  } : {}}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ 
                  background: theme ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` : 'linear-gradient(135deg, #3B82F6, #10B981)'
                }}
              >
                {user?.google_user_data?.given_name?.[0] || user?.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.google_user_data?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h1 className="text-2xl font-semibold text-gray-900 ml-2 lg:ml-0">
                {navigation.find(item => item.href === location.pathname)?.name || 'Suavizar'}
              </h1>
              
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.google_user_data?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole ? getRoleLabel(userRole) : 'Usuário'}
                  </p>
                  {isSuperAdmin && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Shield className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs text-yellow-600 font-medium">Super Admin</span>
                    </div>
                  )}
                </div>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ 
                    background: theme ? `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` : 'linear-gradient(135deg, #3B82F6, #10B981)'
                  }}
                >
                  {user?.google_user_data?.given_name?.[0] || user?.email[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
