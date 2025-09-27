import React from 'react';
import { QuickActionButton } from '../../atoms/QuickActionButton';
import { cn } from '../../../utils/cn';
import type { QuickAction } from '../../../features/dashboard/types';

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  onActionClick,
  className,
  columns = 4,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {actions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          onClick={onActionClick ? () => onActionClick(action) : undefined}
        />
      ))}
    </div>
  );
};