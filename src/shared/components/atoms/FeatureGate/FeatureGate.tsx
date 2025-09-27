import React, { ReactNode } from 'react';
import { useFeatureAccess } from '../../../hooks/useFeatureAccess';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

interface FeatureGateProps {
  /** Chave da feature a ser verificada */
  featureKey: string;
  
  /** Conteúdo a ser renderizado quando a feature está habilitada */
  children: ReactNode;
  
  /** Conteúdo alternativo quando a feature não está disponível */
  fallback?: ReactNode;
  
  /** Se deve mostrar uma mensagem de upgrade quando a feature não está disponível */
  showUpgrade?: boolean;
  
  /** Callback chamado quando o usuário clica em upgrade */
  onUpgrade?: () => void;
  
  /** Se deve mostrar um loading enquanto verifica a feature */
  showLoading?: boolean;
  
  /** Conteúdo do loading */
  loadingContent?: ReactNode;
  
  /** Classe CSS adicional */
  className?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  children,
  fallback,
  showUpgrade = false,
  onUpgrade,
  showLoading = true,
  loadingContent,
  className,
}) => {
  const { enabled, loading, reason } = useFeatureAccess(featureKey);
  
  // Mostra loading se configurado
  if (loading && showLoading) {
    return (
      <div className={`feature-gate-loading ${className || ''}`}>
        {loadingContent || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-600">Carregando...</span>
          </div>
        )}
      </div>
    );
  }
  
  // Se a feature está habilitada, renderiza o conteúdo
  if (enabled) {
    return <>{children}</>;
  }
  
  // Se tem fallback customizado, usa ele
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }
  
  // Se deve mostrar upgrade, renderiza a mensagem
  if (showUpgrade) {
    return (
      <div className={`feature-gate-upgrade p-4 border border-gray-200 rounded-lg bg-gray-50 ${className || ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Premium</Badge>
            <span className="text-sm text-gray-600">
              Esta funcionalidade requer um plano premium
            </span>
          </div>
          {onUpgrade && (
            <Button
              size="sm"
              variant="primary"
              onClick={onUpgrade}
            >
              Fazer Upgrade
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Por padrão, não renderiza nada
  return null;
};

// Componente para mostrar badge de feature premium
interface FeatureBadgeProps {
  featureKey: string;
  children: ReactNode;
  badgeText?: string;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showBadgeWhenDisabled?: boolean;
  className?: string;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  featureKey,
  children,
  badgeText = 'Premium',
  badgeVariant = 'secondary',
  showBadgeWhenDisabled = true,
  className,
}) => {
  const { enabled } = useFeatureAccess(featureKey);
  
  return (
    <div className={`feature-badge-container ${className || ''}`}>
      <div className="flex items-center space-x-2">
        {children}
        {(!enabled && showBadgeWhenDisabled) && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>
    </div>
  );
};

// Componente para desabilitar elementos baseado em features
interface FeatureDisableProps {
  featureKey: string;
  children: ReactNode;
  disabledOpacity?: number;
  showTooltip?: boolean;
  tooltipText?: string;
  className?: string;
}

export const FeatureDisable: React.FC<FeatureDisableProps> = ({
  featureKey,
  children,
  disabledOpacity = 0.5,
  showTooltip = true,
  tooltipText = 'Esta funcionalidade requer um plano premium',
  className,
}) => {
  const { enabled } = useFeatureAccess(featureKey);
  
  if (enabled) {
    return <>{children}</>;
  }
  
  return (
    <div
      className={`feature-disabled ${className || ''}`}
      style={{ opacity: disabledOpacity, pointerEvents: 'none' }}
      title={showTooltip ? tooltipText : undefined}
    >
      {children}
    </div>
  );
};