import React, { useState } from 'react';
import { useTenant } from '../../hooks/useTenant';
import { Button } from '../atoms/Button/Button';
import { Dropdown } from '../molecules/Dropdown/Dropdown';
import { Spinner } from '../atoms/Spinner/Spinner';

export const TenantSwitcher: React.FC = () => {
  const { currentTenant, availableTenants, isLoading, switchTenant } = useTenant();
  const [isSwitching, setIsSwitching] = useState(false);

  // Se há apenas um tenant ou nenhum, não mostrar o switcher
  if (!currentTenant || availableTenants.length <= 1) {
    return null;
  }

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === currentTenant.id) return;

    try {
      setIsSwitching(true);
      await switchTenant(tenantId);
    } catch (error) {
      console.error('Erro ao trocar tenant:', error);
      // Aqui você pode adicionar um toast de erro
    } finally {
      setIsSwitching(false);
    }
  };

  const tenantOptions = availableTenants.map(tenant => ({
    value: tenant.id,
    label: tenant.name,
    icon: tenant.logoUrl ? (
      <img 
        src={tenant.logoUrl} 
        alt={tenant.name}
        className="w-4 h-4 rounded-full"
      />
    ) : (
      <div 
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: tenant.primaryColor }}
      />
    ),
  }));

  if (isLoading || isSwitching) {
    return (
      <div className="flex items-center space-x-2">
        <Spinner size="sm" />
        <span className="text-sm text-gray-600">
          {isSwitching ? 'Trocando...' : 'Carregando...'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Clínica:</span>
      <Dropdown
        options={tenantOptions}
        value={currentTenant.id}
        onChange={handleTenantSwitch}
        placeholder="Selecionar clínica"
        className="min-w-[200px]"
      />
    </div>
  );
};