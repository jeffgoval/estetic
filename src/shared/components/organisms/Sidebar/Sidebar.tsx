import React, { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Avatar } from '../../atoms/Avatar';
import { cn } from '../../../utils/cn';
import { Activity, Menu, Settings, LogOut } from 'lucide-react';
import { IconName } from '../../../utils/iconMap';

export interface SidebarItem {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
}

export interface SidebarUser {
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  user?: SidebarUser;
  onUserMenuClick?: () => void;
  onLogout?: () => void;
  brandName?: string;
  brandIcon?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  user,
  onUserMenuClick,
  onLogout,
  brandName = 'Clínica',
  brandIcon,
  collapsible = true,
  defaultCollapsed = false,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleCollapsed = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
      setUserMenuOpen(false); // Fechar menu do usuário ao colapsar
    }
  };

  return (
    <div
      className={cn(
        'bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Brand/Logo */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            {brandIcon || <Icon icon={Activity} size="sm" className="text-white" />}
          </div>
          {!collapsed && (
            <Text variant="h4" weight="semibold" className="truncate">
              {brandName}
            </Text>
          )}
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className={cn(
                'p-1 h-auto ml-auto',
                collapsed && 'ml-0'
              )}
            >
              <Icon icon={Menu} size="sm" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={item.active ? 'primary' : 'ghost'}
            size="sm"
            onClick={item.onClick}
            className={cn(
              'w-full justify-start',
              collapsed && 'px-2 justify-center'
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size="sm" />
            {!collapsed && (
              <>
                <span className="ml-3 truncate">{item.label}</span>
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
                collapsed && 'px-2 justify-center'
              )}
              title={collapsed ? user.name : undefined}
            >
              <Avatar
                src={user.avatar}
                alt={user.name}
                size="sm"
                fallback={user.name.charAt(0)}
              />
              {!collapsed && (
                <div className="ml-3 text-left min-w-0 flex-1">
                  <Text variant="caption" weight="medium" className="truncate block">
                    {user.name}
                  </Text>
                  <Text variant="small" color="muted" className="truncate block">
                    {user.email}
                  </Text>
                </div>
              )}
            </Button>

            {/* User Menu */}
            {userMenuOpen && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50">
                {onUserMenuClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onUserMenuClick();
                      setUserMenuOpen(false);
                    }}
                    className="w-full justify-start px-4"
                  >
                    <Icon icon={Settings} size="sm" />
                    <span className="ml-2">Configurações</span>
                  </Button>
                )}
                {onLogout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full justify-start px-4 text-error hover:text-error"
                  >
                    <Icon icon={LogOut} size="sm" />
                    <span className="ml-2">Sair</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};