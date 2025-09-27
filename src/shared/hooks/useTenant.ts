import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { nhost } from '../config/nhost';
import type { Tenant } from '../types/auth';

interface UseTenantReturn {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

export const useTenant = (): UseTenantReturn => {
  const { user, refreshUserData } = useAuth();
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar tenants disponíveis para o usuário
  const fetchAvailableTenants = async (): Promise<Tenant[]> => {
    if (!user) return [];

    try {
      const { data, error } = await nhost.graphql.request(`
        query GetUserTenants($userId: uuid!) {
          users(where: {id: {_eq: $userId}}) {
            tenant {
              id
              name
              subdomain
              logo_url
              primary_color
              secondary_color
              is_active
              plan_id
              subscription_status
            }
          }
        }
      `, { userId: user.id });

      if (error) {
        console.error('Erro ao buscar tenants:', error);
        return [];
      }

      return data?.users?.[0]?.tenant ? [data.users[0].tenant] : [];
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      return [];
    }
  };

  // Trocar de tenant (para usuários que têm acesso a múltiplos tenants)
  const switchTenant = async (tenantId: string): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Verificar se o usuário tem acesso ao tenant
      const { data, error } = await nhost.graphql.request(`
        query CheckTenantAccess($userId: uuid!, $tenantId: uuid!) {
          users(where: {
            id: {_eq: $userId}
            tenant_id: {_eq: $tenantId}
          }) {
            id
          }
        }
      `, { userId: user.id, tenantId });

      if (error || !data?.users?.length) {
        throw new Error('Você não tem acesso a este tenant');
      }

      // Atualizar dados do usuário
      await refreshUserData();
      
      // Recarregar tenants disponíveis
      await refreshTenants();
    } catch (error) {
      console.error('Erro ao trocar tenant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenants = async (): Promise<void> => {
    setIsLoading(true);
    const tenants = await fetchAvailableTenants();
    setAvailableTenants(tenants);
    setIsLoading(false);
  };

  // Carregar tenants quando o usuário mudar
  useEffect(() => {
    if (user) {
      refreshTenants();
    } else {
      setAvailableTenants([]);
    }
  }, [user]);

  return {
    currentTenant: user?.tenant || null,
    availableTenants,
    isLoading,
    switchTenant,
    refreshTenants,
  };
};