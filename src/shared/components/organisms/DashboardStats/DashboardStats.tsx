import React from 'react';
import { MetricsGrid } from '../../molecules/MetricsGrid';
import { Text } from '../../atoms/Text';
import { Card } from '../../atoms/Card';
import { Spinner } from '../../atoms/Spinner';
import { cn } from '../../../utils/cn';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../permissions';

interface DashboardStatsProps {
  className?: string;
  onMetricClick?: (metricId: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  className,
  onMetricClick,
}) => {
  const { metrics, loading, error } = useDashboardStats();
  const { hasPermission } = usePermissions();

  // Filtrar métricas baseado nas permissões do usuário
  const visibleMetrics = metrics.filter(metric => 
    metric.permissions.some(permission => hasPermission(permission))
  );

  if (loading) {
    return (
      <Card className={cn('p-6 flex items-center justify-center', className)}>
        <div className="flex items-center space-x-2">
          <Spinner size="sm" />
          <Text color="muted">Carregando estatísticas...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <Text color="error" className="mb-2">
            Erro ao carregar estatísticas
          </Text>
          <Text variant="small" color="muted">
            {error}
          </Text>
        </div>
      </Card>
    );
  }

  if (visibleMetrics.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <Text color="muted">
            Nenhuma estatística disponível
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <Text variant="h3" weight="semibold" className="mb-2">
          Estatísticas da Clínica
        </Text>
        <Text variant="body" color="muted">
          Visão geral das métricas importantes
        </Text>
      </div>

      <MetricsGrid
        metrics={visibleMetrics}
        onMetricClick={onMetricClick ? (metric) => onMetricClick(metric.id) : undefined}
      />
    </div>
  );
};