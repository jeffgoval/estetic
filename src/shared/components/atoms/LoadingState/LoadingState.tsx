import React from 'react';
import { Spinner } from '../Spinner';
import { Text } from '../Text';
import { cn } from '../../../utils/cn';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 'md',
  className,
}) => {
  const containerSizes = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      containerSizes[size],
      className
    )}>
      <Spinner size={size} />
      <Text variant="body" color="muted">
        {message}
      </Text>
    </div>
  );
};