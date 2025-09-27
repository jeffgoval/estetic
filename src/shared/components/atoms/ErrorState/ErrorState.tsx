import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { cn } from '../../../utils/cn';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: {
    label?: string;
    onClick: () => void;
  };
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Algo deu errado',
  message,
  retry,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-12 text-center',
      className
    )}>
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
        <Icon name="AlertCircle" size="lg" className="text-error" />
      </div>
      
      <Text variant="h3" weight="semibold" className="mb-2">
        {title}
      </Text>
      
      <Text variant="body" color="muted" className="mb-6 max-w-md">
        {message}
      </Text>
      
      {retry && (
        <Button onClick={retry.onClick} variant="outline">
          {retry.label || 'Tentar novamente'}
        </Button>
      )}
    </div>
  );
};