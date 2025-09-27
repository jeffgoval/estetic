import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeatureGate, FeatureBadge, FeatureDisable } from '../atoms/FeatureGate';
import { FeatureLimitIndicator, FeatureLimitBadge } from '../molecules/FeatureLimitIndicator';
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

describe('Sistema de Feature Flags', () => {
  beforeEach(() => {
    // Reset do store antes de cada teste
    useFeatureFlagsStore.getState().reset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('FeatureGate', () => {
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
            <div data-testid="feature-content">Conteúdo da feature</div>
          </FeatureGate>
        </TestWrapper>
      );

      // Aguarda o carregamento e verifica se o conteúdo aparece
      const content = await screen.findByTestId('feature-content');
      expect(content).toBeInTheDocument();
    });

    it('deve mostrar mensagem de upgrade quando feature não está habilitada', async () => {
      const mockUpgrade = vi.fn();
      
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
            onUpgrade={mockUpgrade}
          >
            <div>Conteúdo da feature</div>
          </FeatureGate>
        </TestWrapper>
      );

      // Verifica se a mensagem de upgrade aparece
      const upgradeMessage = await screen.findByText('Esta funcionalidade requer um plano premium');
      expect(upgradeMessage).toBeInTheDocument();
      
      // Verifica se o botão de upgrade está presente
      const upgradeButton = screen.getByText('Fazer Upgrade');
      expect(upgradeButton).toBeInTheDocument();
      
      // Testa o clique no botão
      fireEvent.click(upgradeButton);
      expect(mockUpgrade).toHaveBeenCalledTimes(1);
    });

    it('deve mostrar fallback customizado quando fornecido', async () => {
      // Simula feature desabilitada
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'basic',
        name: 'Básico',
        description: 'Plano básico',
        price_monthly: 99.90,
        features: {
          whatsapp_integration: { enabled: false },
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
            featureKey="whatsapp_integration"
            fallback={<div>Feature não disponível</div>}
          >
            <div>Conteúdo da feature</div>
          </FeatureGate>
        </TestWrapper>
      );

      await screen.findByText('Feature não disponível');
      expect(screen.getByText('Feature não disponível')).toBeInTheDocument();
      expect(screen.queryByText('Conteúdo da feature')).not.toBeInTheDocument();
    });
  });

  describe('FeatureBadge', () => {
    it('deve mostrar badge quando feature está desabilitada', async () => {
      // Simula feature desabilitada
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'basic',
        name: 'Básico',
        description: 'Plano básico',
        price_monthly: 99.90,
        features: {
          whatsapp_integration: { enabled: false },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureBadge featureKey="whatsapp_integration">
            <button>Botão Teste</button>
          </FeatureBadge>
        </TestWrapper>
      );

      await screen.findByText('Premium');
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Botão Teste')).toBeInTheDocument();
    });

    it('deve ocultar badge quando feature está habilitada', async () => {
      // Simula feature habilitada
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium',
        price_monthly: 199.90,
        features: {
          whatsapp_integration: { enabled: true },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureBadge featureKey="whatsapp_integration">
            <button>Botão Teste</button>
          </FeatureBadge>
        </TestWrapper>
      );

      await screen.findByText('Botão Teste');
      expect(screen.getByText('Botão Teste')).toBeInTheDocument();
      expect(screen.queryByText('Premium')).not.toBeInTheDocument();
    });
  });

  describe('FeatureDisable', () => {
    it('deve desabilitar conteúdo quando feature não está disponível', async () => {
      // Simula feature desabilitada
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'basic',
        name: 'Básico',
        description: 'Plano básico',
        price_monthly: 99.90,
        features: {
          whatsapp_integration: { enabled: false },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureDisable featureKey="whatsapp_integration">
            <button>Botão Teste</button>
          </FeatureDisable>
        </TestWrapper>
      );

      await screen.findByText('Botão Teste');
      const container = screen.getByText('Botão Teste').parentElement;
      expect(container).toHaveStyle({ opacity: '0.5', pointerEvents: 'none' });
    });

    it('deve manter conteúdo habilitado quando feature está disponível', async () => {
      // Simula feature habilitada
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium',
        price_monthly: 199.90,
        features: {
          whatsapp_integration: { enabled: true },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureDisable featureKey="whatsapp_integration">
            <button>Botão Teste</button>
          </FeatureDisable>
        </TestWrapper>
      );

      await screen.findByText('Botão Teste');
      const button = screen.getByText('Botão Teste');
      expect(button).toBeInTheDocument();
      // Não deve ter estilos de desabilitado
      expect(button.parentElement).not.toHaveStyle({ opacity: '0.5' });
    });
  });

  describe('FeatureLimitIndicator', () => {
    it('deve mostrar indicador de limite quando feature tem limites', async () => {
      // Simula feature com limites
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium',
        price_monthly: 199.90,
        features: {
          whatsapp_integration: { 
            enabled: true, 
            limits: { monthly_limit: 1000 } 
          },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureLimitIndicator
            featureKey="whatsapp_integration"
            currentUsage={750}
            showDetails={true}
          />
        </TestWrapper>
      );

      // Aguarda o carregamento e verifica se os detalhes aparecem
      await screen.findByText('Uso atual');
      expect(screen.getByText('Uso atual')).toBeInTheDocument();
      expect(screen.getByText('750 / 1000')).toBeInTheDocument();
      expect(screen.getByText('250 restantes')).toBeInTheDocument();
    });

    it('não deve renderizar quando feature não tem limites', async () => {
      // Simula feature sem limites
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium',
        price_monthly: 199.90,
        features: {
          whatsapp_integration: { enabled: true }, // Sem limites
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const { container } = render(
        <TestWrapper>
          <FeatureLimitIndicator
            featureKey="whatsapp_integration"
            currentUsage={750}
          />
        </TestWrapper>
      );

      // Aguarda um pouco e verifica se nada foi renderizado
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(container.firstChild).toBeNull();
    });
  });

  describe('FeatureLimitBadge', () => {
    it('deve mostrar badge de limite próximo', async () => {
      // Simula feature próxima ao limite
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium',
        price_monthly: 199.90,
        features: {
          whatsapp_integration: { 
            enabled: true, 
            limits: { monthly_limit: 1000 } 
          },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureLimitBadge
            featureKey="whatsapp_integration"
            currentUsage={850} // 85% do limite
          />
        </TestWrapper>
      );

      await screen.findByText('150 restantes');
      expect(screen.getByText('150 restantes')).toBeInTheDocument();
    });

    it('deve mostrar badge de limite atingido', async () => {
      // Simula feature no limite
      const store = useFeatureFlagsStore.getState();
      store.setCurrentPlan({
        id: 'premium',
        name: 'Premium',
        description: 'Plano premium',
        price_monthly: 199.90,
        features: {
          whatsapp_integration: { 
            enabled: true, 
            limits: { monthly_limit: 1000 } 
          },
        },
        is_active: true,
        is_popular: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(
        <TestWrapper>
          <FeatureLimitBadge
            featureKey="whatsapp_integration"
            currentUsage={1000} // 100% do limite
          />
        </TestWrapper>
      );

      await screen.findByText('Limite atingido');
      expect(screen.getByText('Limite atingido')).toBeInTheDocument();
    });
  });
});