import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FeatureFlag, FeatureAccess, SubscriptionPlan, TenantFeatureOverride } from '../types';

interface FeatureFlagsState {
  // Estado das feature flags
  featureFlags: FeatureFlag[];
  subscriptionPlans: SubscriptionPlan[];
  tenantOverrides: TenantFeatureOverride[];
  
  // Cache de acesso às features
  featureAccess: Record<string, FeatureAccess>;
  
  // Estado de carregamento
  loading: boolean;
  error: string | null;
  
  // Informações do plano atual do tenant
  currentPlan: SubscriptionPlan | null;
  
  // Ações para gerenciar feature flags
  setFeatureFlags: (flags: FeatureFlag[]) => void;
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void;
  setTenantOverrides: (overrides: TenantFeatureOverride[]) => void;
  setCurrentPlan: (plan: SubscriptionPlan | null) => void;
  
  // Ações para cache de acesso
  setFeatureAccess: (featureKey: string, access: FeatureAccess) => void;
  clearFeatureAccessCache: () => void;
  
  // Ações de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Ações de verificação de acesso
  hasFeatureAccess: (featureKey: string) => boolean;
  getFeatureAccess: (featureKey: string) => FeatureAccess | null;
  getFeatureLimits: (featureKey: string) => Record<string, any> | null;
  
  // Ações para super admin
  updateFeatureFlag: (flag: FeatureFlag) => void;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => void;
  addTenantOverride: (override: TenantFeatureOverride) => void;
  removeTenantOverride: (overrideId: string) => void;
  
  // Reset do store
  reset: () => void;
}

const initialState = {
  featureFlags: [],
  subscriptionPlans: [],
  tenantOverrides: [],
  featureAccess: {},
  loading: false,
  error: null,
  currentPlan: null,
};

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Setters básicos
      setFeatureFlags: (flags) => set({ featureFlags: flags }),
      setSubscriptionPlans: (plans) => set({ subscriptionPlans: plans }),
      setTenantOverrides: (overrides) => set({ tenantOverrides: overrides }),
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      
      // Cache de acesso
      setFeatureAccess: (featureKey, access) => 
        set((state) => ({
          featureAccess: {
            ...state.featureAccess,
            [featureKey]: access,
          },
        })),
      
      clearFeatureAccessCache: () => set({ featureAccess: {} }),
      
      // Estado
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Verificação de acesso
      hasFeatureAccess: (featureKey) => {
        const access = get().getFeatureAccess(featureKey);
        return access?.enabled ?? false;
      },
      
      getFeatureAccess: (featureKey) => {
        const state = get();
        
        // Verifica cache primeiro
        if (state.featureAccess[featureKey]) {
          return state.featureAccess[featureKey];
        }
        
        // Se não tem plano, nega acesso
        if (!state.currentPlan) {
          return { enabled: false, reason: 'no_plan' };
        }
        
        // Verifica se existe override específico do tenant
        const override = state.tenantOverrides.find(
          (o) => o.feature_flag_id === featureKey
        );
        
        if (override) {
          const access: FeatureAccess = {
            enabled: override.is_enabled,
            limits: override.limits,
            reason: override.reason || 'tenant_override',
          };
          
          // Salva no cache
          state.setFeatureAccess(featureKey, access);
          return access;
        }
        
        // Verifica se a feature está incluída no plano
        const planFeatures = state.currentPlan.features as Record<string, any>;
        const featureEnabled = planFeatures[featureKey]?.enabled ?? false;
        const featureLimits = planFeatures[featureKey]?.limits;
        
        const access: FeatureAccess = {
          enabled: featureEnabled,
          limits: featureLimits,
          reason: featureEnabled ? 'plan_included' : 'not_in_plan',
        };
        
        // Salva no cache
        state.setFeatureAccess(featureKey, access);
        return access;
      },
      
      getFeatureLimits: (featureKey) => {
        const access = get().getFeatureAccess(featureKey);
        return access?.limits || null;
      },
      
      // Ações para super admin
      updateFeatureFlag: (flag) =>
        set((state) => ({
          featureFlags: state.featureFlags.map((f) =>
            f.id === flag.id ? flag : f
          ),
        })),
      
      updateSubscriptionPlan: (plan) =>
        set((state) => ({
          subscriptionPlans: state.subscriptionPlans.map((p) =>
            p.id === plan.id ? plan : p
          ),
          // Atualiza plano atual se for o mesmo
          currentPlan: state.currentPlan?.id === plan.id ? plan : state.currentPlan,
        })),
      
      addTenantOverride: (override) =>
        set((state) => ({
          tenantOverrides: [...state.tenantOverrides, override],
        })),
      
      removeTenantOverride: (overrideId) =>
        set((state) => ({
          tenantOverrides: state.tenantOverrides.filter((o) => o.id !== overrideId),
        })),
      
      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'feature-flags-store',
    }
  )
);