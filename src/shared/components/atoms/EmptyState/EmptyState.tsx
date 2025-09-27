import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { cn } from '../../../utils/cn';
import { IconName } from '../../../utils/iconMap';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'Search',
  action,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-12 text-center',
      className
    )}>
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <Icon name={icon} size="lg" className="text-neutral-400" />
      </div>
      
      <Text variant="h3" weight="semibold" className="mb-2">
        {title}
      </Text>
      
      {description && (
        <Text variant="body" color="muted" className="mb-6 max-w-md">
          {description}
        </Text>
      )}
      
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};