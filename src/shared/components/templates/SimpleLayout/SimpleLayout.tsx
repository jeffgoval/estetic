import React from 'react';
import { AppShell } from '../AppShell';
import { Header, Breadcrumb } from '../../organisms/Header';
import { cn } from '../../../utils/cn';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  sidebar,
  footer,
  className,
  contentClassName,
}) => {
  const header = (title || subtitle || breadcrumbs || actions) ? (
    <Header
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  ) : undefined;

  return (
    <AppShell
      sidebar={sidebar}
      header={header}
      footer={footer}
      className={className}
    >
      <div className={cn('p-6', contentClassName)}>
        {children}
      </div>
    </AppShell>
  );
};