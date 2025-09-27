import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface PatientAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const PatientAvatar: React.FC<PatientAvatarProps> = ({ 
  name, 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        className
      )}
    >
      {name ? (
        getInitials(name)
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};

export { PatientAvatar };