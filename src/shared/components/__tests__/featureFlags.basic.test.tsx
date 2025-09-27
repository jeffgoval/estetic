import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFeatureFlagsStore } from '../../stores/useFeatureFlagsStore';

// Mock do hook useTenant
vi.mock('../../hooks/useTenant', () => ({
  useTenant: () => ({
    tenant: {
      id: 1,
      name: 'Clínica Teste',
      plan_type: 'basic',
    },
  }),
}));

describe('Feature Flags Store - Teste Básico', () => {
  it('deve inicializar o store corretamente', () => {
    const store = useFeatureFlagsStore.getState();
    
    expect(store.featureFlags).toEqual([]);
    expect(store.subscriptionPlans).toEqual([]);
    expect(store.currentPlan).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('deve definir plano atual corretamente', () => {
    const store = useFeatureFlagsStore.getState();
    
    const testPlan = {
      id: 'test',
      name: 'Test Plan',
      description: 'Test',
      price_monthly: 99.90,
      features: {
        test_feature: { enabled: true },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    store.setCurrentPlan(testPlan);
    
    expect(store.currentPlan).toEqual(testPlan);
  });

  it('deve verificar acesso a feature corretamente', () => {
    const store = useFeatureFlagsStore.getState();
    
    // Define um plano com uma feature habilitada
    store.setCurrentPlan({
      id: 'premium',
      name: 'Premium',
      description: 'Premium plan',
      price_monthly: 199.90,
      features: {
        enabled_feature: { enabled: true },
        disabled_feature: { enabled: false },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    // Testa feature habilitada
    expect(store.hasFeatureAccess('enabled_feature')).toBe(true);
    
    // Testa feature desabilitada
    expect(store.hasFeatureAccess('disabled_feature')).toBe(false);
    
    // Testa feature inexistente
    expect(store.hasFeatureAccess('nonexistent_feature')).toBe(false);
  });

  it('deve retornar acesso negado quando não há plano', () => {
    const store = useFeatureFlagsStore.getState();
    
    // Reset para garantir que não há plano
    store.reset();
    
    expect(store.hasFeatureAccess('any_feature')).toBe(false);
    
    const access = store.getFeatureAccess('any_feature');
    expect(access?.enabled).toBe(false);
    expect(access?.reason).toBe('no_plan');
  });

  it('deve gerenciar cache de acesso corretamente', () => {
    const store = useFeatureFlagsStore.getState();
    
    // Define um plano
    store.setCurrentPlan({
      id: 'basic',
      name: 'Basic',
      description: 'Basic plan',
      price_monthly: 99.90,
      features: {
        cached_feature: { enabled: true },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    // Primeira chamada - deve calcular e cachear
    const access1 = store.getFeatureAccess('cached_feature');
    expect(access1?.enabled).toBe(true);
    
    // Segunda chamada - deve usar cache
    const access2 = store.getFeatureAccess('cached_feature');
    expect(access2).toEqual(access1);
    
    // Limpa cache
    store.clearFeatureAccessCache();
    
    // Terceira chamada - deve recalcular
    const access3 = store.getFeatureAccess('cached_feature');
    expect(access3?.enabled).toBe(true);
  });
});