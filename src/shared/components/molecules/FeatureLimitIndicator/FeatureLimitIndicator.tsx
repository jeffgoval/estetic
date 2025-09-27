import React from 'react';
import { useFeatureLimits } from '../../../hooks/useFeatureAccess';
import { Badge } from '../../atoms/Badge/Badge';

interface FeatureLimitIndicatorProps {
  /** Chave da feature */
  featureKey: string;
  
  /** Uso atual da feature */
  currentUsage: number;
  
  /** Se deve mostrar a barra de progresso */
  showProgressBar?: boolean;
  
  /** Se deve mostrar os números detalhados */
  showDetails?: boolean;
  
  /** Tamanho do indicador */
  size?: 'sm' | 'md' | 'lg';
  
  /** Classe CSS adicional */
  className?: string;
}

export const FeatureLimitIndicator: React.FC<FeatureLimitIndicatorProps> = ({
  featureKey,
  currentUsage,
  showProgressBar = true,
  showDetails = true,
  size = 'md',
  className,
}) => {
  const {
    hasLimits,
    unlimited,
    limit,
    usage,
    remaining,
    percentage,
    nearLimit,
    atLimit,
  } = useFeatureLimits(featureKey, currentUsage);
  
  // Se não tem limites, não mostra nada
  if (!hasLimits || unlimited) {
    return null;
  }
  
  // Determina a cor baseada no uso
  const getColor = () => {
    if (atLimit) return 'error';
    if (nearLimit) return 'warning';
    return 'success';
  };
  
  const color = getColor();
  
  // Classes baseadas no tamanho
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const progressBarHeight = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  return (
    <div className={`feature-limit-indicator ${sizeClasses[size]} ${className || ''}`}>
      {/* Badge de status */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-600">Uso atual</span>
        <Badge
          variant={color}
          size="sm"
        >
          {atLimit ? 'Limite atingido' : nearLimit ? 'Próximo ao limite' : 'Normal'}
        </Badge>
      </div>
      
      {/* Detalhes numéricos */}
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">
            {usage} / {limit}
          </span>
          <span className="text-gray-500">
            {remaining} restantes
          </span>
        </div>
      )}
      
      {/* Barra de progresso */}
      {showProgressBar && (
        <div className={`w-full bg-gray-200 rounded-full ${progressBarHeight[size]}`}>
          <div
            className={`${progressBarHeight[size]} rounded-full transition-all duration-300 ${
              color === 'error'
                ? 'bg-red-500'
                : color === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      {/* Porcentagem */}
      {showDetails && (
        <div className="text-right mt-1">
          <span className="text-gray-500">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Componente simples para mostrar apenas o status
interface FeatureLimitBadgeProps {
  featureKey: string;
  currentUsage: number;
  className?: string;
}

export const FeatureLimitBadge: React.FC<FeatureLimitBadgeProps> = ({
  featureKey,
  currentUsage,
  className,
}) => {
  const { hasLimits, unlimited, atLimit, nearLimit, remaining } = useFeatureLimits(
    featureKey,
    currentUsage
  );
  
  if (!hasLimits || unlimited) {
    return null;
  }
  
  const getVariant = () => {
    if (atLimit) return 'error';
    if (nearLimit) return 'warning';
    return 'success';
  };
  
  const getText = () => {
    if (atLimit) return 'Limite atingido';
    if (nearLimit) return `${remaining} restantes`;
    return 'Dentro do limite';
  };
  
  return (
    <Badge
      variant={getVariant()}
      size="sm"
      className={className}
    >
      {getText()}
    </Badge>
  );
};