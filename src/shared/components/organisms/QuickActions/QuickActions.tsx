import React from 'react';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { QuickActionsGrid } from '../../molecules/QuickActionsGrid';
import { cn } from '../../../utils/cn';
import { useQuickActions } from '../../../hooks/dashboard/useQuickActions';

interface QuickActionsProps {
  className?: string;
  maxActions?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  className,
  maxActions = 8,
}) => {
  const { actions, handleActionClick } = useQuickActions();

  const visibleActions = actions.slice(0, maxActions);

  if (visibleActions.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <Text color="muted">
            Nenhuma ação rápida disponível
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-0', className)}>
      <div className="p-6 border-b border-neutral-200">
        <Text variant="h4" weight="semibold" className="mb-1">
          Ações Rápidas
        </Text>
        <Text variant="body" color="muted">
          Acesse rapidamente as funcionalidades mais usadas
        </Text>
      </div>
      
      <div className="p-6">
        <QuickActionsGrid
          actions={visibleActions}
          onActionClick={handleActionClick}
        />
      </div>
    </Card>
  );
};