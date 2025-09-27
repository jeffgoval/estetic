import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';
import { 
  Building2, 
  Users, 
  TrendingUp,
  Settings,
  Flag,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { PERMISSIONS } from '@/shared/permissions';
import { PlanManager, FeatureFlagManager, TenantOverview } from '@/shared/components/organisms';
// import type { Tenant } from '@/shared/types'; // Não utilizado no momento
import type { 
  SuperAdminSubscriptionPlan, 
  SuperAdminFeatureFlag, 
  SuperAdminTenantOverview,
  SuperAdminPlatformStats,
  CreateSuperAdminSubscriptionPlan,
  CreateSuperAdminFeatureFlag
} from '@/shared/types/superAdmin';

type ActiveTab = 'overview' | 'tenants' | 'plans' | 'features';

export default function SuperAdmin() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  
  // Estado das abas
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  // Estados dos dados
  const [stats, setStats] = useState<SuperAdminPlatformStats>({
    total_tenants: 0,
    active_tenants: 0,
    trial_tenants: 0,
    suspended_tenants: 0,
    total_users: 0,
    total_patients: 0,
    total_appointments: 0,
    monthly_growth: 0,
    revenue_current_month: 0,
    revenue_last_month: 0,
    churn_rate: 0,
    avg_appointments_per_tenant: 0,
  });
  const [tenants, setTenants] = useState<SuperAdminTenantOverview[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SuperAdminSubscriptionPlan[]>([]);
  const [featureFlags, setFeatureFlags] = useState<SuperAdminFeatureFlag[]>([]);
  
  // Estados de carregamento
  const [loading, setLoading] = useState(true);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchTenants(),
        fetchSubscriptionPlans(),
        fetchFeatureFlags(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock data - substituir por API real
      const mockStats: SuperAdminPlatformStats = {
        total_tenants: 45,
        active_tenants: 38,
        trial_tenants: 12,
        suspended_tenants: 7,
        total_users: 156,
        total_patients: 2340,
        total_appointments: 8920,
        monthly_growth: 15.2,
        revenue_current_month: 12500.00,
        revenue_last_month: 10800.00,
        churn_rate: 2.1,
        avg_appointments_per_tenant: 235,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchTenants = async () => {
    setTenantsLoading(true);
    try {
      // Mock data - substituir por API real
      const mockTenants: SuperAdminTenantOverview[] = [
        {
          id: '1',
          name: 'Clínica Estética Bella',
          subdomain: 'bella',
          is_active: true,
          subscription_status: 'active',
          plan_name: 'Plano Pro',
          user_count: 5,
          patient_count: 120,
          appointment_count: 450,
          last_activity: new Date().toISOString(),
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          primary_color: '#3B82F6',
          secondary_color: '#10B981',
        },
        {
          id: '2',
          name: 'Spa Harmonia',
          subdomain: 'harmonia',
          is_active: true,
          subscription_status: 'trial',
          plan_name: 'Trial',
          user_count: 2,
          patient_count: 35,
          appointment_count: 89,
          last_activity: new Date(Date.now() - 86400000).toISOString(),
          created_at: '2024-02-01T14:30:00Z',
          updated_at: '2024-02-01T14:30:00Z',
          primary_color: '#3B82F6',
          secondary_color: '#10B981',
        },
      ];
      setTenants(mockTenants);
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
    } finally {
      setTenantsLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    setPlansLoading(true);
    try {
      // Mock data - substituir por API real
      const mockPlans: SuperAdminSubscriptionPlan[] = [
        {
          id: '1',
          name: 'Plano Básico',
          description: 'Ideal para clínicas pequenas',
          price_monthly: 99.90,
          price_yearly: 999.00,
          max_users: 3,
          max_patients: 100,
          max_appointments_per_month: 300,
          features: {},
          is_active: true,
          is_popular: false,
          sort_order: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Plano Pro',
          description: 'Para clínicas em crescimento',
          price_monthly: 199.90,
          price_yearly: 1999.00,
          max_users: 10,
          max_patients: 500,
          max_appointments_per_month: 1000,
          features: {},
          is_active: true,
          is_popular: true,
          sort_order: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      setSubscriptionPlans(mockPlans);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchFeatureFlags = async () => {
    setFeaturesLoading(true);
    try {
      // Mock data - substituir por API real
      const mockFeatures: SuperAdminFeatureFlag[] = [
        {
          id: '1',
          key: 'whatsapp_integration',
          name: 'Integração WhatsApp',
          description: 'Permite envio de mensagens via WhatsApp',
          category: 'communication',
          is_premium: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          key: 'ai_agent',
          name: 'Agente de IA',
          description: 'Assistente virtual para atendimento',
          category: 'ai',
          is_premium: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          key: 'advanced_reports',
          name: 'Relatórios Avançados',
          description: 'Relatórios detalhados e analytics',
          category: 'analytics',
          is_premium: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      setFeatureFlags(mockFeatures);
    } catch (error) {
      console.error('Erro ao buscar feature flags:', error);
    } finally {
      setFeaturesLoading(false);
    }
  };

  // Handlers para planos
  const handleCreatePlan = async (planData: CreateSuperAdminSubscriptionPlan) => {
    try {
      // Mock implementation - substituir por API real
      const newPlan: SuperAdminSubscriptionPlan = {
        id: Date.now().toString(),
        ...planData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };
      setSubscriptionPlans(prev => [...prev, newPlan]);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  };

  const handleUpdatePlan = async (id: string, planData: Partial<SuperAdminSubscriptionPlan>) => {
    try {
      // Mock implementation - substituir por API real
      setSubscriptionPlans(prev => 
        prev.map(plan => 
          plan.id === id 
            ? { ...plan, ...planData, updated_at: new Date().toISOString() }
            : plan
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      // Mock implementation - substituir por API real
      setSubscriptionPlans(prev => prev.filter(plan => plan.id !== id));
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      throw error;
    }
  };

  const handleTogglePlanStatus = async (id: string, isActive: boolean) => {
    try {
      // Mock implementation - substituir por API real
      setSubscriptionPlans(prev => 
        prev.map(plan => 
          plan.id === id 
            ? { ...plan, is_active: isActive, updated_at: new Date().toISOString() }
            : plan
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
      throw error;
    }
  };

  // Handlers para feature flags
  const handleCreateFeatureFlag = async (flagData: CreateSuperAdminFeatureFlag) => {
    try {
      // Mock implementation - substituir por API real
      const newFlag: SuperAdminFeatureFlag = {
        id: Date.now().toString(),
        ...flagData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setFeatureFlags(prev => [...prev, newFlag]);
    } catch (error) {
      console.error('Erro ao criar feature flag:', error);
      throw error;
    }
  };

  const handleUpdateFeatureFlag = async (id: string, flagData: Partial<SuperAdminFeatureFlag>) => {
    try {
      // Mock implementation - substituir por API real
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.id === id 
            ? { ...flag, ...flagData, updated_at: new Date().toISOString() }
            : flag
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar feature flag:', error);
      throw error;
    }
  };

  const handleDeleteFeatureFlag = async (id: string) => {
    try {
      // Mock implementation - substituir por API real
      setFeatureFlags(prev => prev.filter(flag => flag.id !== id));
    } catch (error) {
      console.error('Erro ao excluir feature flag:', error);
      throw error;
    }
  };

  // Handlers para tenants
  const handleToggleTenantStatus = async (id: string, isActive: boolean) => {
    try {
      // Mock implementation - substituir por API real
      setTenants(prev => 
        prev.map(tenant => 
          tenant.id === id 
            ? { ...tenant, is_active: isActive, updated_at: new Date().toISOString() }
            : tenant
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status do tenant:', error);
      throw error;
    }
  };

  const handleViewTenantDetails = (tenant: SuperAdminTenantOverview) => {
    // Mock implementation - implementar modal ou navegação para detalhes
    console.log('Ver detalhes do tenant:', tenant);
    alert(`Detalhes da clínica: ${tenant.name}\nStatus: ${tenant.subscription_status}\nUsuários: ${tenant.user_count}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'tenants' as const, label: 'Clínicas', icon: Building2 },
    { id: 'plans' as const, label: 'Planos', icon: CreditCard },
    { id: 'features' as const, label: 'Features', icon: Flag },
  ];

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Clínicas</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_tenants}</p>
                    <p className="text-xs text-emerald-600 mt-1">
                      {stats.active_tenants} ativas
                    </p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Usuários</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.total_users}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Média: {Math.round(stats.total_users / stats.total_tenants)} por clínica
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Receita Mensal</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(stats.revenue_current_month)}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      +{Math.round(((stats.revenue_current_month - stats.revenue_last_month) / stats.revenue_last_month) * 100)}% vs mês anterior
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Crescimento</p>
                    <p className="text-3xl font-bold text-green-600">+{stats.monthly_growth}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Churn: {stats.churn_rate}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
                <p className="text-sm text-gray-600">Últimas ações na plataforma</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nova clínica cadastrada</p>
                      <p className="text-xs text-gray-500">Spa Harmonia - há 2 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-emerald-50 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Plano atualizado</p>
                      <p className="text-xs text-gray-500">Clínica Bella mudou para Pro - há 4 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pico de agendamentos</p>
                      <p className="text-xs text-gray-500">+{stats.total_appointments} agendamentos este mês</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tenants':
        return (
          <TenantOverview
            tenants={tenants}
            loading={tenantsLoading}
            onToggleTenantStatus={handleToggleTenantStatus}
            onViewTenantDetails={handleViewTenantDetails}
          />
        );

      case 'plans':
        return (
          <PlanManager
            plans={subscriptionPlans}
            loading={plansLoading}
            onCreatePlan={handleCreatePlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onTogglePlanStatus={handleTogglePlanStatus}
          />
        );

      case 'features':
        return (
          <FeatureFlagManager
            featureFlags={featureFlags}
            loading={featuresLoading}
            onCreateFeatureFlag={handleCreateFeatureFlag}
            onUpdateFeatureFlag={handleUpdateFeatureFlag}
            onDeleteFeatureFlag={handleDeleteFeatureFlag}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
      <Layout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Super Admin</h2>
                <p className="text-purple-100 text-lg">
                  Painel de controle da plataforma EsteticPro
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Settings className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 ml-3">Carregando dados...</p>
                </div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
