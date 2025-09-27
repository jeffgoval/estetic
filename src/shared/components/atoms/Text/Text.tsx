import React from 'react';
import { cn } from '../../../utils/cn';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'small';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'error' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: keyof React.JSX.IntrinsicElements;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'default',
  weight = 'normal',
  as,
  className,
  ...props
}) => {
  const variantClasses = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm',
    small: 'text-xs',
  };

  const colorClasses = {
    default: 'text-neutral-900',
    muted: 'text-neutral-600',
    primary: 'text-primary',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const defaultTags = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    caption: 'span',
    small: 'small',
  } as const;

  const Component = as || defaultTags[variant];

  return React.createElement(
    Component as any,
    {
      className: cn(
        variantClasses[variant],
        colorClasses[color],
        weightClasses[weight],
        className
      ),
      ...props,
    },
    children
  );
};