import React from 'react';
import { cn } from '../../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  className,
  ...props 
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const displayFallback = fallback || (alt ? alt.charAt(0).toUpperCase() : '?');

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-secondary',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted font-medium text-neutral-600">
          {displayFallback}
        </div>
      )}
    </div>
  );
};

export { Avatar };