import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useFeatureFlagsStore } from '../stores/useFeatureFlagsStore';
import { useTenant } from '../hooks/useTenant';
import type { FeatureAccess } from '../types';

interface FeatureFlagContextType {
  // Verificação de acesso a features
  hasFeature: (featureKey: string) => boolean;
  getFeatureAccess: (featureKey: string) => FeatureAccess | null;
  getFeatureLimits: (featureKey: string) => Record<string, any> | null;
  
  // Estado de carregamento
  loading: boolean;
  error: string | null;
  
  // Informações do plano
  currentPlanName: string | null;
  isFreePlan: boolean;
  isPremiumPlan: boolean;
  
  // Funções utilitárias
  refreshFeatureFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const {
    hasFeatureAccess,
    getFeatureAccess,
    getFeatureLimits,
    loading,
    error,
    currentPlan,
    setLoading,
    setError,
    setFeatureFlags,
    setSubscriptionPlans,
    setCurrentPlan,
    setTenantOverrides,
    clearFeatureAccessCache,
  } = useFeatureFlagsStore();
  
  const { tenant } = useTenant();

  // Carrega as feature flags e configurações do tenant
  const loadFeatureFlags = async () => {
    if (!tenant) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar chamadas GraphQL para carregar:
      // 1. Feature flags disponíveis
      // 2. Planos de assinatura
      // 3. Plano atual do tenant
      // 4. Overrides específicos do tenant
      
      // Por enquanto, vamos simular dados para desenvolvimento
      const mockFeatureFlags = [
        {
          id: '1',
          key: 'whatsapp_integration',
          name: 'Integração WhatsApp',
          description: 'Permite envio de mensagens via WhatsApp',
          category: 'communication',
          is_premium: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          key: 'ai_agent',
          name: 'Agente de IA',
          description: 'Assistente virtual para atendimento',
          category: 'automation',
          is_premium: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          key: 'advanced_reports',
          name: 'Relatórios Avançados',
          description: 'Relatórios detalhados e analytics',
          category: 'analytics',
          is_premium: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          key: 'basic_scheduling',
          name: 'Agendamento Básico',
          description: 'Funcionalidades básicas de agendamento',
          category: 'core',
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      const mockPlans = [
        {
          id: 'basic',
          name: 'Básico',
          description: 'Plano básico para clínicas pequenas',
          price_monthly: 99.90,
          price_yearly: 999.90,
          max_users: 3,
          max_patients: 500,
          max_appointments_per_month: 200,
          features: {
            basic_scheduling: { enabled: true },
            patient_management: { enabled: true },
            basic_reports: { enabled: true },
            whatsapp_integration: { enabled: false },
            ai_agent: { enabled: false },
            advanced_reports: { enabled: false },
          },
          is_active: true,
          is_popular: false,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Plano completo com todas as funcionalidades',
          price_monthly: 199.90,
          price_yearly: 1999.90,
          max_users: 10,
          max_patients: 2000,
          max_appointments_per_month: 1000,
          features: {
            basic_scheduling: { enabled: true },
            patient_management: { enabled: true },
            basic_reports: { enabled: true },
            whatsapp_integration: { enabled: true, limits: { messages_per_month: 1000 } },
            ai_agent: { enabled: true, limits: { conversations_per_month: 500 } },
            advanced_reports: { enabled: true },
          },
          is_active: true,
          is_popular: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      // Simula o plano atual do tenant (básico por padrão)
      const currentTenantPlan = mockPlans.find(p => p.id === (tenant.plan_type || 'basic'));
      
      setFeatureFlags(mockFeatureFlags);
      setSubscriptionPlans(mockPlans);
      setCurrentPlan(currentTenantPlan || null);
      setTenantOverrides([]); // Sem overrides por enquanto
      
    } catch (err) {
      console.error('Erro ao carregar feature flags:', err);
      setError('Erro ao carregar configurações de funcionalidades');
    } finally {
      setLoading(false);
    }
  };

  // Recarrega as feature flags
  const refreshFeatureFlags = async () => {
    clearFeatureAccessCache();
    await loadFeatureFlags();
  };

  // Carrega as feature flags quando o tenant muda
  useEffect(() => {
    if (tenant) {
      loadFeatureFlags();
    }
  }, [tenant?.id]);

  // Valores do contexto
  const contextValue: FeatureFlagContextType = {
    hasFeature: hasFeatureAccess,
    getFeatureAccess,
    getFeatureLimits,
    loading,
    error,
    currentPlanName: currentPlan?.name || null,
    isFreePlan: currentPlan?.id === 'free' || false,
    isPremiumPlan: currentPlan?.id === 'premium' || false,
    refreshFeatureFlags,
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Hook para usar o contexto de feature flags
export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags deve ser usado dentro de um FeatureFlagProvider');
  }
  return context;
};