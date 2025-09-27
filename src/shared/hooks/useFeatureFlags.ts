import { useFeatureFlags as useFeatureFlagsContext } from '../contexts/FeatureFlagContext';

// Re-exporta o hook do contexto para manter a API consistente
export const useFeatureFlags = useFeatureFlagsContext;