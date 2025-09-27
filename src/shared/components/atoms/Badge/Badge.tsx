import React from 'react';
import { cn } from '../../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'secondary';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default', 
  size = 'md',
  children,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  const variants = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    warning: 'bg-warning text-white',
    secondary: 'bg-secondary text-neutral-900',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge };