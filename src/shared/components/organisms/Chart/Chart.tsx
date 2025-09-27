import React from 'react';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { Spinner } from '../../atoms/Spinner';
import { cn } from '../../../utils/cn';

export interface ChartProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

export const Chart: React.FC<ChartProps> = ({
  title,
  description,
  children,
  loading = false,
  error,
  className,
  headerActions,
}) => {
  return (
    <Card className={cn('p-0', className)}>
      {(title || description || headerActions) && (
        <div className="p-6 pb-4 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <Text variant="h4" weight="semibold">
                  {title}
                </Text>
              )}
              {description && (
                <Text variant="body" color="muted">
                  {description}
                </Text>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <Text variant="body" color="error">
              {error}
            </Text>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
};