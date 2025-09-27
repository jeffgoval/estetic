import React from 'react';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { Spinner } from '../../atoms/Spinner';
import { cn } from '../../../utils/cn';
import { useRecentActivity } from '../../../hooks/dashboard/useRecentActivity';
import type { RecentActivity as RecentActivityType } from '../../../features/dashboard/types';

interface RecentActivityProps {
  className?: string;
  maxItems?: number;
  onActivityClick?: (activity: RecentActivityType) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  className,
  maxItems = 5,
  onActivityClick,
}) => {
  const { activities, loading, error } = useRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'Calendar';
      case 'patient':
        return 'Users';
      case 'material':
        return 'Package';
      case 'whatsapp':
        return 'MessageSquare';
      case 'ai_lead':
        return 'Bot';
      case 'professional':
        return 'UserCheck';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'primary';
      case 'patient':
        return 'secondary';
      case 'material':
        return 'warning';
      case 'whatsapp':
        return 'success';
      case 'ai_lead':
        return 'primary';
      case 'professional':
        return 'secondary';
      default:
        return 'neutral';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className={cn('p-0', className)}>
      <div className="p-6 border-b border-neutral-200">
        <Text variant="h4" weight="semibold" className="mb-1">
          Atividade Recente
        </Text>
        <Text variant="body" color="muted">
          Últimas ações realizadas na clínica
        </Text>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Spinner size="sm" />
              <Text color="muted">Carregando atividades...</Text>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <Text color="error" className="mb-2">
              Erro ao carregar atividades
            </Text>
            <Text variant="small" color="muted">
              {error}
            </Text>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center">
            <Text color="muted">
              Nenhuma atividade recente
            </Text>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {activities.slice(0, maxItems).map((activity) => {
              const iconName = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const isClickable = !!onActivityClick;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    'p-4 transition-colors',
                    isClickable && 'cursor-pointer hover:bg-neutral-50'
                  )}
                  onClick={isClickable ? () => onActivityClick(activity) : undefined}
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        `bg-${color}/10`
                      )}
                    >
                      <Icon 
                        name={iconName as any}
                        size="sm"
                        className={`text-${color}`}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Text variant="small" className="mb-1">
                        {activity.description}
                      </Text>
                      
                      <div className="flex items-center justify-between">
                        {activity.userName && (
                          <Text variant="small" color="muted">
                            por {activity.userName}
                          </Text>
                        )}
                        <Text variant="small" color="muted">
                          {formatTimestamp(activity.timestamp)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activities.length > maxItems && (
        <div className="p-4 border-t border-neutral-200 text-center">
          <Text variant="small" color="primary" className="cursor-pointer hover:underline">
            Ver todas as atividades
          </Text>
        </div>
      )}
    </Card>
  );
};