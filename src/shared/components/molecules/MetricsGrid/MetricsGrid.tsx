import React from 'react';
import { MetricCard } from '../../atoms/MetricCard';
import { cn } from '../../../utils/cn';
import type { DashboardMetric } from '../../../features/dashboard/types';

interface MetricsGridProps {
  metrics: DashboardMetric[];
  onMetricClick?: (metric: DashboardMetric) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  onMetricClick,
  className,
  columns = 4,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      gridCols[columns],
      className
    )}>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          metric={metric}
          onClick={onMetricClick ? () => onMetricClick(metric) : undefined}
        />
      ))}
    </div>
  );
};