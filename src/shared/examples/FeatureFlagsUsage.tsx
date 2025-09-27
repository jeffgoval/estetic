import React from 'react';
import {
  FeatureGate,
  FeatureBadge,
  FeatureDisable,
  Button,
  Card,
} from '../components';
import {
  FeatureLimitIndicator,
  FeatureLimitBadge,
} from '../components/molecules/FeatureLimitIndicator';
import {
  useFeatureFlags,
  useFeatureAccess,
  usePremiumFeatures,
  useFeatureLimits,
} from '../hooks';

export const FeatureFlagsUsage: React.FC = () => {
  const { currentPlanName, isPremiumPlan } = useFeatureFlags();
  const whatsappAccess = useFeatureAccess('whatsapp_integration');
  const aiAccess = useFeatureAccess('ai_agent');
  const premiumFeatures = usePremiumFeatures();
  
  // Simula uso atual para demonstração
  const currentWhatsAppUsage = 750; // 750 mensagens enviadas
  const currentAIUsage = 120; // 120 conversas
  
  const whatsappLimits = useFeatureLimits('whatsapp_integration', currentWhatsAppUsage);
  const aiLimits = useFeatureLimits('ai_agent', currentAIUsage);

  const handleUpgrade = () => {
    console.log('Redirecionando para página de upgrade...');
    // Implementar redirecionamento para página de planos
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Sistema de Feature Flags</h1>
        <p className="text-gray-600">
          Demonstração do sistema de controle de funcionalidades baseado em planos
        </p>
        <div className="mt-2">
          <span className="text-sm text-gray-500">
            Plano atual: <strong>{currentPlanName}</strong>
            {isPremiumPlan && <span className="text-green-600 ml-2">✓ Premium</span>}
          </span>
        </div>
      </div>

      {/* Exemplo 1: FeatureGate básico */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">1. FeatureGate Básico</h3>
        
        <FeatureGate featureKey="whatsapp_integration">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800">Integração WhatsApp Ativa</h4>
            <p className="text-green-600 text-sm">
              Você pode enviar mensagens via WhatsApp para seus pacientes.
            </p>
          </div>
        </FeatureGate>

        <FeatureGate 
          featureKey="ai_agent"
          showUpgrade={true}
          onUpgrade={handleUpgrade}
        >
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800">Agente de IA Ativo</h4>
            <p className="text-blue-600 text-sm">
              Seu assistente virtual está pronto para atender pacientes.
            </p>
          </div>
        </FeatureGate>
      </Card>

      {/* Exemplo 2: FeatureBadge */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">2. FeatureBadge</h3>
        
        <div className="space-y-2">
          <FeatureBadge featureKey="whatsapp_integration">
            <Button>Enviar WhatsApp</Button>
          </FeatureBadge>
          
          <FeatureBadge featureKey="ai_agent" badgeText="Pro">
            <Button>Ativar IA</Button>
          </FeatureBadge>
          
          <FeatureBadge featureKey="advanced_reports" badgeText="Premium" badgeVariant="warning">
            <Button>Relatórios Avançados</Button>
          </FeatureBadge>
        </div>
      </Card>

      {/* Exemplo 3: FeatureDisable */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">3. FeatureDisable</h3>
        
        <div className="space-y-2">
          <FeatureDisable featureKey="whatsapp_integration">
            <Button>Configurar WhatsApp</Button>
          </FeatureDisable>
          
          <FeatureDisable 
            featureKey="ai_agent"
            tooltipText="Agente de IA disponível apenas no plano Premium"
          >
            <Button>Treinar IA</Button>
          </FeatureDisable>
        </div>
      </Card>

      {/* Exemplo 4: Indicadores de Limite */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">4. Indicadores de Limite</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">WhatsApp - Uso Mensal</h4>
            <FeatureLimitIndicator
              featureKey="whatsapp_integration"
              currentUsage={currentWhatsAppUsage}
              showProgressBar={true}
              showDetails={true}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">IA - Conversas Mensais</h4>
            <FeatureLimitIndicator
              featureKey="ai_agent"
              currentUsage={currentAIUsage}
              showProgressBar={true}
              showDetails={true}
              size="sm"
            />
          </div>
        </div>
      </Card>

      {/* Exemplo 5: Badges de Limite */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">5. Badges de Limite</h3>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <span>WhatsApp:</span>
            <FeatureLimitBadge
              featureKey="whatsapp_integration"
              currentUsage={currentWhatsAppUsage}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span>IA:</span>
            <FeatureLimitBadge
              featureKey="ai_agent"
              currentUsage={currentAIUsage}
            />
          </div>
        </div>
      </Card>

      {/* Exemplo 6: Informações de Acesso */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">6. Informações de Acesso</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">WhatsApp Integration</h4>
            <p className="text-sm text-gray-600">
              Habilitado: {whatsappAccess.enabled ? '✅ Sim' : '❌ Não'} | 
              Motivo: {whatsappAccess.reason} | 
              Carregando: {whatsappAccess.loading ? 'Sim' : 'Não'}
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">AI Agent</h4>
            <p className="text-sm text-gray-600">
              Habilitado: {aiAccess.enabled ? '✅ Sim' : '❌ Não'} | 
              Motivo: {aiAccess.reason} | 
              Carregando: {aiAccess.loading ? 'Sim' : 'Não'}
            </p>
          </div>
        </div>
      </Card>

      {/* Exemplo 7: Resumo de Features Premium */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">7. Resumo Features Premium</h3>
        
        <div className="space-y-2">
          <p className="text-sm">
            <strong>É Premium:</strong> {premiumFeatures.isPremium ? 'Sim' : 'Não'}
          </p>
          <p className="text-sm">
            <strong>Plano:</strong> {premiumFeatures.planName}
          </p>
          <p className="text-sm">
            <strong>Tem alguma feature premium:</strong> {premiumFeatures.hasAnyPremiumFeature ? 'Sim' : 'Não'}
          </p>
          
          <div className="mt-3">
            <h4 className="font-medium text-sm mb-2">Status das Features Premium:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(premiumFeatures.features).map(([key, feature]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={feature.enabled ? 'text-green-600' : 'text-red-600'}>
                    {feature.enabled ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Exemplo 8: Informações de Limites */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">8. Informações Detalhadas de Limites</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">WhatsApp Limits</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Tem limites: {whatsappLimits.hasLimits ? 'Sim' : 'Não'}</p>
              <p>Ilimitado: {whatsappLimits.unlimited ? 'Sim' : 'Não'}</p>
              {whatsappLimits.hasLimits && (
                <>
                  <p>Limite: {whatsappLimits.limit}</p>
                  <p>Uso: {whatsappLimits.usage}</p>
                  <p>Restante: {whatsappLimits.remaining}</p>
                  <p>Porcentagem: {whatsappLimits.percentage?.toFixed(1)}%</p>
                  <p>Próximo ao limite: {whatsappLimits.nearLimit ? 'Sim' : 'Não'}</p>
                  <p>No limite: {whatsappLimits.atLimit ? 'Sim' : 'Não'}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">AI Limits</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Tem limites: {aiLimits.hasLimits ? 'Sim' : 'Não'}</p>
              <p>Ilimitado: {aiLimits.unlimited ? 'Sim' : 'Não'}</p>
              {aiLimits.hasLimits && (
                <>
                  <p>Limite: {aiLimits.limit}</p>
                  <p>Uso: {aiLimits.usage}</p>
                  <p>Restante: {aiLimits.remaining}</p>
                  <p>Porcentagem: {aiLimits.percentage?.toFixed(1)}%</p>
                  <p>Próximo ao limite: {aiLimits.nearLimit ? 'Sim' : 'Não'}</p>
                  <p>No limite: {aiLimits.atLimit ? 'Sim' : 'Não'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};