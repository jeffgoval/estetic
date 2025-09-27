import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { iconMap, IconName } from '../../../utils/iconMap';

export interface IconProps {
  icon?: LucideIcon;
  name?: IconName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ icon, name, size = 'md', className }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  const IconComponent = icon || (name ? iconMap[name] : null);
  
  if (!IconComponent) {
    console.warn(`Ícone não encontrado: ${name}`);
    return null;
  }

  return (
    <IconComponent
      className={cn(sizes[size], className)}
    />
  );
};

export { Icon };