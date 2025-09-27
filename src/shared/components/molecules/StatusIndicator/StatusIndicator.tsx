import React from 'react';
import { Badge } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../../utils/cn';

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  label: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const statusConfig = {
    success: {
      color: 'success' as const,
      icon: 'CheckCircle',
    },
    error: {
      color: 'error' as const,
      icon: 'XCircle',
    },
    warning: {
      color: 'warning' as const,
      icon: 'AlertTriangle',
    },
    info: {
      color: 'primary' as const,
      icon: 'Info',
    },
    pending: {
      color: 'secondary' as const,
      icon: 'Clock',
    },
  };

  const config = statusConfig[status];
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  return (
    <Badge
      variant={config.color}
      size={size}
      className={cn('flex items-center gap-1', className)}
    >
      {showIcon && <Icon name={config.icon} size={iconSize} />}
      {label}
    </Badge>
  );
};