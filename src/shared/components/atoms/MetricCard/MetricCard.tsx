import React from 'react';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { cn } from '../../../utils/cn';
import type { DashboardMetric } from '../../../features/dashboard/types';

interface MetricCardProps {
  metric: DashboardMetric;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  className,
  onClick,
}) => {
  const isClickable = !!onClick;

  return (
    <Card 
      className={cn(
        'p-6 transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text variant="caption" color="muted" className="mb-1">
            {metric.title}
          </Text>
          <Text variant="h2" weight="bold" className="mb-2">
            {metric.value}
          </Text>
          {metric.trend && (
            <div className="flex items-center space-x-1">
              <Icon 
                name={metric.trend.isPositive ? 'TrendingUp' : 'TrendingDown'}
                size="sm"
                className={cn(
                  metric.trend.isPositive ? 'text-success' : 'text-error'
                )}
              />
              <Text 
                variant="small" 
                color={metric.trend.isPositive ? 'success' : 'error'}
              >
                {metric.trend.label}
              </Text>
            </div>
          )}
        </div>
        
        <div 
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            `bg-${metric.color}/10`
          )}
        >
          <Icon 
            name={metric.icon as any}
            size="md"
            className={`text-${metric.color}`}
          />
        </div>
      </div>
    </Card>
  );
};