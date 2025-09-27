import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeatureGate } from '../atoms/FeatureGate';
import { FeatureFlagProvider } from '../../contexts/FeatureFlagContext';
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

// Componente wrapper para testes
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureFlagProvider>
    {children}
  </FeatureFlagProvider>
);

describe('Sistema de Feature Flags - Testes Simples', () => {
  beforeEach(() => {
    // Reset do store antes de cada teste
    useFeatureFlagsStore.getState().reset();
  });

  it('deve renderizar conteúdo quando feature está habilitada', async () => {
    // Simula feature habilitada
    const store = useFeatureFlagsStore.getState();
    store.setCurrentPlan({
      id: 'premium',
      name: 'Premium',
      description: 'Plano premium',
      price_monthly: 199.90,
      features: {
        test_feature: { enabled: true },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(
      <TestWrapper>
        <FeatureGate featureKey="test_feature">
          <div data-testid="feature-content">Conteúdo habilitado</div>
        </FeatureGate>
      </TestWrapper>
    );

    // Verifica se o conteúdo aparece
    const content = await screen.findByTestId('feature-content');
    expect(content).toBeTruthy();
    expect(content.textContent).toBe('Conteúdo habilitado');
  });

  it('deve mostrar upgrade quando feature está desabilitada', async () => {
    // Simula feature desabilitada
    const store = useFeatureFlagsStore.getState();
    store.setCurrentPlan({
      id: 'basic',
      name: 'Básico',
      description: 'Plano básico',
      price_monthly: 99.90,
      features: {
        test_feature_disabled: { enabled: false },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(
      <TestWrapper>
        <FeatureGate 
          featureKey="test_feature_disabled"
          showUpgrade={true}
        >
          <div data-testid="feature-content">Conteúdo premium</div>
        </FeatureGate>
      </TestWrapper>
    );

    // Verifica se a mensagem de upgrade aparece
    const upgradeMessage = await screen.findByText('Esta funcionalidade requer um plano premium');
    expect(upgradeMessage).toBeTruthy();
    
    // Verifica se o conteúdo premium não aparece
    expect(screen.queryByTestId('feature-content')).toBeNull();
  });

  it('deve usar fallback customizado quando fornecido', async () => {
    // Simula feature desabilitada
    const store = useFeatureFlagsStore.getState();
    store.setCurrentPlan({
      id: 'basic',
      name: 'Básico',
      description: 'Plano básico',
      price_monthly: 99.90,
      features: {
        test_feature_fallback: { enabled: false },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(
      <TestWrapper>
        <FeatureGate 
          featureKey="test_feature_fallback"
          fallback={<div data-testid="fallback-content">Feature não disponível</div>}
        >
          <div data-testid="feature-content">Conteúdo premium</div>
        </FeatureGate>
      </TestWrapper>
    );

    // Verifica se o fallback aparece
    const fallbackContent = await screen.findByTestId('fallback-content');
    expect(fallbackContent).toBeTruthy();
    expect(fallbackContent.textContent).toBe('Feature não disponível');
    
    // Verifica se o conteúdo premium não aparece
    expect(screen.queryByTestId('feature-content')).toBeNull();
  });

  it('deve não renderizar nada quando feature desabilitada sem upgrade ou fallback', async () => {
    // Simula feature desabilitada
    const store = useFeatureFlagsStore.getState();
    store.setCurrentPlan({
      id: 'basic',
      name: 'Básico',
      description: 'Plano básico',
      price_monthly: 99.90,
      features: {
        test_feature_hidden: { enabled: false },
      },
      is_active: true,
      is_popular: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const { container } = render(
      <TestWrapper>
        <FeatureGate featureKey="test_feature_hidden">
          <div data-testid="feature-content">Conteúdo premium</div>
        </FeatureGate>
      </TestWrapper>
    );

    // Aguarda um pouco para garantir que nada foi renderizado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verifica se nada foi renderizado
    expect(screen.queryByTestId('feature-content')).toBeNull();
    expect(screen.queryByText('Esta funcionalidade requer um plano premium')).toBeNull();
    expect(container.firstChild).toBeNull();
  });
});