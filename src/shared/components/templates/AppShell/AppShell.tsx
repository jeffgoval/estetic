import React from 'react';
import { cn } from '../../../utils/cn';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  sidebar,
  header,
  footer,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-neutral-50', className)}>
      <div className="flex h-screen">
        {sidebar && (
          <aside className="flex-shrink-0">
            {sidebar}
          </aside>
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {header && (
            <header className="flex-shrink-0">
              {header}
            </header>
          )}
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          {footer && (
            <footer className="flex-shrink-0">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};