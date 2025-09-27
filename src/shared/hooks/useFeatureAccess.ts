import { useMemo } from 'react';
import { useFeatureFlags } from './useFeatureFlags';
import type { FeatureAccess } from '../types';

/**
 * Hook para verificar acesso a uma feature específica
 * @param featureKey - Chave da feature a ser verificada
 * @returns Objeto com informações de acesso à feature
 */
export const useFeatureAccess = (featureKey: string) => {
  const { hasFeature, getFeatureAccess, getFeatureLimits, loading } = useFeatureFlags();
  
  const featureAccess = useMemo(() => {
    if (loading) {
      return {
        enabled: false,
        loading: true,
        limits: null,
        usage: null,
        reason: 'loading',
      };
    }
    
    const access = getFeatureAccess(featureKey);
    const limits = getFeatureLimits(featureKey);
    
    return {
      enabled: hasFeature(featureKey),
      loading: false,
      limits,
      usage: access?.usage || null,
      reason: access?.reason || 'unknown',
      access: access,
    };
  }, [featureKey, hasFeature, getFeatureAccess, getFeatureLimits, loading]);
  
  return featureAccess;
};

/**
 * Hook para verificar múltiplas features de uma vez
 * @param featureKeys - Array de chaves das features
 * @returns Objeto com status de cada feature
 */
export const useMultipleFeatureAccess = (featureKeys: string[]) => {
  const { hasFeature, getFeatureAccess, loading } = useFeatureFlags();
  
  const featuresAccess = useMemo(() => {
    if (loading) {
      return featureKeys.reduce((acc, key) => {
        acc[key] = {
          enabled: false,
          loading: true,
          reason: 'loading',
        };
        return acc;
      }, {} as Record<string, { enabled: boolean; loading: boolean; reason: string; access?: FeatureAccess }>);
    }
    
    return featureKeys.reduce((acc, key) => {
      const access = getFeatureAccess(key);
      acc[key] = {
        enabled: hasFeature(key),
        loading: false,
        reason: access?.reason || 'unknown',
        access,
      };
      return acc;
    }, {} as Record<string, { enabled: boolean; loading: boolean; reason: string; access?: FeatureAccess }>);
  }, [featureKeys, hasFeature, getFeatureAccess, loading]);
  
  return featuresAccess;
};

/**
 * Hook para verificar se o usuário tem acesso a features premium
 */
export const usePremiumFeatures = () => {
  const { isPremiumPlan, currentPlanName } = useFeatureFlags();
  
  const premiumFeatures = [
    'whatsapp_integration',
    'ai_agent',
    'advanced_reports',
    'bulk_messaging',
    'custom_branding',
    'api_access',
  ];
  
  const premiumAccess = useMultipleFeatureAccess(premiumFeatures);
  
  return {
    isPremium: isPremiumPlan,
    planName: currentPlanName,
    features: premiumAccess,
    hasAnyPremiumFeature: Object.values(premiumAccess).some(f => f.enabled),
  };
};

/**
 * Hook para verificar limites de uso de uma feature
 * @param featureKey - Chave da feature
 * @param currentUsage - Uso atual (opcional)
 */
export const useFeatureLimits = (featureKey: string, currentUsage?: number) => {
  const { getFeatureLimits } = useFeatureFlags();
  
  const limits = useMemo(() => {
    const featureLimits = getFeatureLimits(featureKey);
    
    if (!featureLimits) {
      return {
        hasLimits: false,
        unlimited: true,
        remaining: null,
        percentage: null,
        nearLimit: false,
        atLimit: false,
      };
    }
    
    // Verifica diferentes tipos de limites
    const monthlyLimit = featureLimits.monthly_limit || featureLimits.limit;
    const dailyLimit = featureLimits.daily_limit;
    
    if (!monthlyLimit && !dailyLimit) {
      return {
        hasLimits: false,
        unlimited: true,
        remaining: null,
        percentage: null,
        nearLimit: false,
        atLimit: false,
      };
    }
    
    const usage = currentUsage || 0;
    const limit = monthlyLimit || dailyLimit || 0;
    const remaining = Math.max(0, limit - usage);
    const percentage = limit > 0 ? (usage / limit) * 100 : 0;
    
    return {
      hasLimits: true,
      unlimited: false,
      limit,
      usage,
      remaining,
      percentage,
      nearLimit: percentage >= 80, // 80% do limite
      atLimit: percentage >= 100,
      limits: featureLimits,
    };
  }, [featureKey, getFeatureLimits, currentUsage]);
  
  return limits;
};