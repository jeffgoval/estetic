import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { cn } from '../../../utils/cn';
import type { QuickAction } from '../../../features/dashboard/types';

interface QuickActionButtonProps {
  action: QuickAction;
  onClick?: () => void;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  action,
  onClick,
  className,
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        'flex flex-col items-center p-4 h-auto space-y-2 transition-all duration-200',
        `hover:bg-${action.color}/10 hover:border-${action.color}/20`,
        'border border-transparent rounded-lg',
        className
      )}
      onClick={onClick}
    >
      <div 
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          `bg-${action.color}/10`
        )}
      >
        <Icon 
          name={action.icon as any}
          size="md"
          className={`text-${action.color}`}
        />
      </div>
      
      <div className="text-center">
        <Text 
          variant="small" 
          weight="medium" 
          className={`text-${action.color}`}
        >
          {action.title}
        </Text>
        {action.description && (
          <Text variant="small" color="muted" className="mt-1">
            {action.description}
          </Text>
        )}
      </div>
    </Button>
  );
};