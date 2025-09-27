import React from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { cn } from '../../../utils/cn';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onMenuClick,
  showMenuButton = false,
  className,
}) => {
  return (
    <header className={cn('bg-white border-b border-neutral-200 px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {showMenuButton && onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="flex-shrink-0"
            >
              <Icon name="Menu" size="md" />
            </Button>
          )}

          <div className="min-w-0 flex-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-1">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Icon icon={ChevronRight} size="sm" />}
                    <button
                      onClick={crumb.onClick}
                      className={cn(
                        'hover:text-neutral-900 transition-colors',
                        index === breadcrumbs.length - 1
                          ? 'text-neutral-900 font-medium cursor-default'
                          : 'cursor-pointer',
                        !crumb.onClick && 'cursor-default'
                      )}
                      disabled={!crumb.onClick}
                    >
                      {crumb.label}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            )}
            
            {title && (
              <div className="space-y-1">
                <Text variant="h2" weight="semibold" className="truncate">
                  {title}
                </Text>
                {subtitle && (
                  <Text variant="body" color="muted" className="truncate">
                    {subtitle}
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};