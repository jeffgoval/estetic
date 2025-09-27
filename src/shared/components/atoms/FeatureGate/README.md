# Sistema de Feature Flags

O sistema de feature flags permite controlar o acesso a funcionalidades baseado nos planos de assinatura dos tenants. É uma implementação completa para SaaS multi-tenant com controle granular de features.

## Componentes Principais

### FeatureGate

Componente que controla a renderização de conteúdo baseado no acesso a uma feature.

```tsx
import { FeatureGate } from '@/shared/components';

// Uso básico
<FeatureGate featureKey="whatsapp_integration">
  <WhatsAppPanel />
</FeatureGate>

// Com fallback customizado
<FeatureGate 
  featureKey="ai_agent"
  fallback={<div>IA não disponível no seu plano</div>}
>
  <AIAgentPanel />
</FeatureGate>

// Com opção de upgrade
<FeatureGate 
  featureKey="advanced_reports"
  showUpgrade={true}
  onUpgrade={() => navigate('/upgrade')}
>
  <AdvancedReports />
</FeatureGate>
```

### FeatureBadge

Adiciona badges indicando features premium em elementos da UI.

```tsx
import { FeatureBadge } from '@/shared/components';

<FeatureBadge featureKey="whatsapp_integration">
  <Button>Enviar WhatsApp</Button>
</FeatureBadge>

<FeatureBadge 
  featureKey="ai_agent" 
  badgeText="Pro" 
  badgeVariant="warning"
>
  <Button>Ativar IA</Button>
</FeatureBadge>
```

### FeatureDisable

Desabilita visualmente elementos quando a feature não está disponível.

```tsx
import { FeatureDisable } from '@/shared/components';

<FeatureDisable 
  featureKey="bulk_messaging"
  tooltipText="Envio em massa disponível apenas no plano Premium"
>
  <Button>Enviar para Todos</Button>
</FeatureDisable>
```

## Indicadores de Limite

### FeatureLimitIndicator

Mostra o uso atual e limites de uma feature.

```tsx
import { FeatureLimitIndicator } from '@/shared/components';

<FeatureLimitIndicator
  featureKey="whatsapp_integration"
  currentUsage={750}
  showProgressBar={true}
  showDetails={true}
  size="md"
/>
```

### FeatureLimitBadge

Badge simples mostrando status do limite.

```tsx
import { FeatureLimitBadge } from '@/shared/components';

<FeatureLimitBadge
  featureKey="ai_agent"
  currentUsage={120}
/>
```

## Hooks

### useFeatureFlags

Hook principal para acessar informações de feature flags.

```tsx
import { useFeatureFlags } from '@/shared/hooks';

const MyComponent = () => {
  const {
    hasFeature,
    getFeatureAccess,
    getFeatureLimits,
    loading,
    error,
    currentPlanName,
    isPremiumPlan,
    refreshFeatureFlags,
  } = useFeatureFlags();

  const canUseWhatsApp = hasFeature('whatsapp_integration');
  const whatsappAccess = getFeatureAccess('whatsapp_integration');
  const whatsappLimits = getFeatureLimits('whatsapp_integration');

  return (
    <div>
      <p>Plano atual: {currentPlanName}</p>
      <p>WhatsApp disponível: {canUseWhatsApp ? 'Sim' : 'Não'}</p>
      {whatsappLimits && (
        <p>Limite mensal: {whatsappLimits.monthly_limit}</p>
      )}
    </div>
  );
};
```

### useFeatureAccess

Hook para verificar acesso a uma feature específica.

```tsx
import { useFeatureAccess } from '@/shared/hooks';

const WhatsAppButton = () => {
  const { enabled, loading, limits, reason } = useFeatureAccess('whatsapp_integration');

  if (loading) return <Spinner />;
  
  if (!enabled) {
    return <Button disabled>WhatsApp não disponível</Button>;
  }

  return <Button>Enviar WhatsApp</Button>;
};
```

### useMultipleFeatureAccess

Verifica múltiplas features de uma vez.

```tsx
import { useMultipleFeatureAccess } from '@/shared/hooks';

const PremiumPanel = () => {
  const features = useMultipleFeatureAccess([
    'whatsapp_integration',
    'ai_agent',
    'advanced_reports'
  ]);

  return (
    <div>
      {Object.entries(features).map(([key, feature]) => (
        <div key={key}>
          {key}: {feature.enabled ? '✅' : '❌'}
        </div>
      ))}
    </div>
  );
};
```

### usePremiumFeatures

Hook especializado para features premium.

```tsx
import { usePremiumFeatures } from '@/shared/hooks';

const PremiumSection = () => {
  const { isPremium, planName, features, hasAnyPremiumFeature } = usePremiumFeatures();

  if (!hasAnyPremiumFeature) {
    return <UpgradePrompt />;
  }

  return (
    <div>
      <h2>Features Premium ({planName})</h2>
      {/* Renderizar features premium disponíveis */}
    </div>
  );
};
```

### useFeatureLimits

Hook para trabalhar com limites de uso.

```tsx
import { useFeatureLimits } from '@/shared/hooks';

const WhatsAppUsage = () => {
  const currentUsage = 750; // Obtido de alguma API
  const {
    hasLimits,
    unlimited,
    limit,
    usage,
    remaining,
    percentage,
    nearLimit,
    atLimit,
  } = useFeatureLimits('whatsapp_integration', currentUsage);

  if (unlimited) {
    return <p>Uso ilimitado</p>;
  }

  return (
    <div>
      <p>Usado: {usage} / {limit}</p>
      <p>Restante: {remaining}</p>
      {nearLimit && <Alert>Próximo ao limite!</Alert>}
      {atLimit && <Alert variant="error">Limite atingido!</Alert>}
    </div>
  );
};
```

## Configuração

### 1. Adicionar o Provider

Envolva sua aplicação com o `FeatureFlagProvider`:

```tsx
import { FeatureFlagProvider } from '@/shared/contexts';

function App() {
  return (
    <FeatureFlagProvider>
      <YourApp />
    </FeatureFlagProvider>
  );
}
```

### 2. Definir Feature Keys

Crie constantes para as chaves das features:

```tsx
// constants/featureFlags.ts
export const FEATURE_FLAGS = {
  WHATSAPP_INTEGRATION: 'whatsapp_integration',
  AI_AGENT: 'ai_agent',
  ADVANCED_REPORTS: 'advanced_reports',
  BULK_MESSAGING: 'bulk_messaging',
  CUSTOM_BRANDING: 'custom_branding',
  API_ACCESS: 'api_access',
} as const;
```

### 3. Configurar Planos

Os planos são configurados no backend, mas aqui está um exemplo da estrutura:

```json
{
  "id": "premium",
  "name": "Premium",
  "features": {
    "whatsapp_integration": {
      "enabled": true,
      "limits": {
        "monthly_limit": 1000,
        "daily_limit": 50
      }
    },
    "ai_agent": {
      "enabled": true,
      "limits": {
        "conversations_per_month": 500
      }
    },
    "advanced_reports": {
      "enabled": true
    }
  }
}
```

## Padrões de Uso

### 1. Renderização Condicional

```tsx
// ❌ Não faça isso
const MyComponent = () => {
  const { hasFeature } = useFeatureFlags();
  
  return (
    <div>
      {hasFeature('whatsapp_integration') && <WhatsAppPanel />}
    </div>
  );
};

// ✅ Faça isso
const MyComponent = () => {
  return (
    <div>
      <FeatureGate featureKey="whatsapp_integration">
        <WhatsAppPanel />
      </FeatureGate>
    </div>
  );
};
```

### 2. Botões com Features Premium

```tsx
// ✅ Padrão recomendado
const PremiumButton = () => {
  return (
    <FeatureBadge featureKey="ai_agent">
      <FeatureDisable featureKey="ai_agent">
        <Button onClick={handleAIAction}>
          Ativar IA
        </Button>
      </FeatureDisable>
    </FeatureBadge>
  );
};
```

### 3. Verificação de Limites

```tsx
// ✅ Verificar limites antes de ações
const SendWhatsAppButton = () => {
  const currentUsage = useWhatsAppUsage(); // Hook customizado
  const { atLimit } = useFeatureLimits('whatsapp_integration', currentUsage);
  
  const handleSend = () => {
    if (atLimit) {
      showUpgradeModal();
      return;
    }
    
    sendWhatsAppMessage();
  };
  
  return (
    <Button 
      onClick={handleSend}
      disabled={atLimit}
    >
      Enviar WhatsApp
      {atLimit && <Badge variant="error">Limite atingido</Badge>}
    </Button>
  );
};
```

## Testes

O sistema inclui testes abrangentes. Para executar:

```bash
npm run test -- featureFlags.test.tsx
```

Exemplo de teste:

```tsx
import { render, screen } from '@testing-library/react';
import { FeatureGate } from '@/shared/components';
import { TestWrapper } from '@/test-utils';

test('deve renderizar conteúdo quando feature está habilitada', async () => {
  // Configurar mock do plano premium
  mockPremiumPlan();
  
  render(
    <TestWrapper>
      <FeatureGate featureKey="whatsapp_integration">
        <div>Conteúdo WhatsApp</div>
      </FeatureGate>
    </TestWrapper>
  );
  
  await screen.findByText('Conteúdo WhatsApp');
  expect(screen.getByText('Conteúdo WhatsApp')).toBeInTheDocument();
});
```

## Considerações de Performance

1. **Cache de Acesso**: O sistema mantém cache das verificações de acesso para evitar recálculos desnecessários.

2. **Lazy Loading**: Use `React.lazy()` para componentes de features premium:

```tsx
const PremiumComponent = React.lazy(() => import('./PremiumComponent'));

<FeatureGate featureKey="premium_feature">
  <Suspense fallback={<Spinner />}>
    <PremiumComponent />
  </Suspense>
</FeatureGate>
```

3. **Memoização**: Use `useMemo` para cálculos complexos de features:

```tsx
const availableFeatures = useMemo(() => {
  return features.filter(f => hasFeature(f.key));
}, [features, hasFeature]);
```

## Troubleshooting

### Feature não aparece mesmo com plano correto

1. Verifique se a feature key está correta
2. Confirme se o plano do tenant está atualizado
3. Limpe o cache: `refreshFeatureFlags()`

### Limites não funcionam

1. Verifique se os limites estão definidos no plano
2. Confirme se o `currentUsage` está sendo passado corretamente
3. Verifique se a estrutura dos limites está correta

### Performance lenta

1. Use `useMultipleFeatureAccess` para verificar várias features
2. Implemente lazy loading para componentes pesados
3. Considere memoização para cálculos complexos