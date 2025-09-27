import React, { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Avatar } from '../../atoms/Avatar';
import { cn } from '../../../utils/cn';
import { Activity, Menu, ChevronRight, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: Array<{
    id: string;
    label: string;
    icon: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    badge?: string | number;
  }>;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onUserMenuClick?: () => void;
  onLogout?: () => void;
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarItems,
  user,
  onUserMenuClick,
  onLogout,
  title,
  breadcrumbs,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div
        className={cn(
          'bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon icon={Activity} size="md" className="text-white" />
            </div>
            {sidebarOpen && (
              <Text variant="h4" weight="semibold">
                Clínica
              </Text>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={item.active ? 'primary' : 'ghost'}
              size="sm"
              onClick={item.onClick}
              className={cn(
                'w-full justify-start',
                !sidebarOpen && 'px-2'
              )}
            >
              <Icon name={item.icon as any} size="sm" />
              {sidebarOpen && (
                <>
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-neutral-200">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  'w-full justify-start',
                  !sidebarOpen && 'px-2'
                )}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  size="sm"
                />
                {sidebarOpen && (
                  <div className="ml-3 text-left">
                    <Text variant="caption" weight="medium">
                      {user.name}
                    </Text>
                    <Text variant="small" color="muted">
                      {user.email}
                    </Text>
                  </div>
                )}
              </Button>

              {/* User Menu */}
              {userMenuOpen && sidebarOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-neutral-200 rounded-lg shadow-lg py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUserMenuClick}
                    className="w-full justify-start px-4"
                  >
                    <Icon icon={Settings} size="sm" />
                    <span className="ml-2">Configurações</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="w-full justify-start px-4 text-error hover:text-error"
                  >
                    <Icon icon={LogOut} size="sm" />
                    <span className="ml-2">Sair</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Icon icon={Menu} size="md" />
              </Button>

              <div>
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-1">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Icon icon={ChevronRight} size="sm" />}
                        <span
                          className={cn(
                            index === breadcrumbs.length - 1
                              ? 'text-neutral-900 font-medium'
                              : 'hover:text-neutral-900 cursor-pointer'
                          )}
                        >
                          {crumb.label}
                        </span>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
                {title && (
                  <Text variant="h2" weight="semibold">
                    {title}
                  </Text>
                )}
              </div>
            </div>

            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};