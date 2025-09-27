import { useAuthenticationStatus, useUserData, useSignOut } from '@nhost/react';
import { useEffect, useState } from 'react';
import { nhost } from '../config/nhost';
import type { UserWithTenant } from '../types/auth';

interface UseAuthReturn {
  user: UserWithTenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const userData = useUserData();
  const { signOut: nhostSignOut } = useSignOut();
  
  const [user, setUser] = useState<UserWithTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar dados do usuário e tenant
  const fetchUserWithTenant = async (userId: string): Promise<UserWithTenant | null> => {
    try {
      const { data, error } = await nhost.graphql.request(`
        query GetUserWithTenant($userId: uuid!) {
          users_by_pk(id: $userId) {
            id
            email
            display_name
            role
            is_active
            tenant_id
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
      `, { userId });

      if (error || !data?.users_by_pk) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      const userDb = data.users_by_pk;
      
      return {
        id: userDb.id,
        email: userDb.email,
        displayName: userDb.display_name,
        roles: [userDb.role],
        defaultRole: userDb.role,
        tenantId: userDb.tenant_id,
        role: userDb.role,
        tenant: userDb.tenant ? {
          id: userDb.tenant.id,
          name: userDb.tenant.name,
          subdomain: userDb.tenant.subdomain,
          logoUrl: userDb.tenant.logo_url,
          primaryColor: userDb.tenant.primary_color,
          secondaryColor: userDb.tenant.secondary_color,
          isActive: userDb.tenant.is_active,
          planId: userDb.tenant.plan_id,
          subscriptionStatus: userDb.tenant.subscription_status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Função para criar usuário e tenant na primeira autenticação
  const createUserAndTenant = async (authUser: any): Promise<UserWithTenant | null> => {
    try {
      // Primeiro, criar o tenant
      const { data: tenantData, error: tenantError } = await nhost.graphql.request(`
        mutation CreateTenant($name: String!) {
          insert_tenants_one(object: {
            name: $name
            primary_color: "#3B82F6"
            secondary_color: "#10B981"
            subscription_status: "trial"
          }) {
            id
            name
            primary_color
            secondary_color
            subscription_status
          }
        }
      `, { 
        name: authUser.displayName ? `Clínica de ${authUser.displayName}` : 'Minha Clínica'
      });

      if (tenantError || !tenantData?.insert_tenants_one) {
        console.error('Erro ao criar tenant:', tenantError);
        return null;
      }

      const tenant = tenantData.insert_tenants_one;

      // Depois, criar o usuário
      const { data: userData, error: userError } = await nhost.graphql.request(`
        mutation CreateUser($id: uuid!, $email: String!, $displayName: String, $tenantId: uuid!) {
          insert_users_one(object: {
            id: $id
            email: $email
            display_name: $displayName
            tenant_id: $tenantId
            role: "owner"
          }) {
            id
            email
            display_name
            role
            tenant_id
          }
        }
      `, {
        id: authUser.id,
        email: authUser.email,
        displayName: authUser.displayName,
        tenantId: tenant.id,
      });

      if (userError || !userData?.insert_users_one) {
        console.error('Erro ao criar usuário:', userError);
        return null;
      }

      return {
        id: authUser.id,
        email: authUser.email,
        displayName: authUser.displayName,
        roles: ['owner'],
        defaultRole: 'owner',
        tenantId: tenant.id,
        role: 'owner',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          primaryColor: tenant.primary_color,
          secondaryColor: tenant.secondary_color,
          isActive: true,
          subscriptionStatus: tenant.subscription_status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Erro ao criar usuário e tenant:', error);
      return null;
    }
  };

  // Atualizar dados do usuário quando a autenticação mudar
  useEffect(() => {
    const updateUser = async () => {
      setIsLoading(true);
      
      if (isAuthenticated && userData) {
        // Tentar buscar usuário existente
        let userWithTenant = await fetchUserWithTenant(userData.id);
        
        // Se não existir, criar novo usuário e tenant
        if (!userWithTenant) {
          userWithTenant = await createUserAndTenant(userData);
        }
        
        setUser(userWithTenant);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    if (!authLoading) {
      updateUser();
    }
  }, [isAuthenticated, userData, authLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await nhost.auth.signIn({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await nhost.auth.signUp({
        email,
        password,
        options: {
          displayName,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await nhostSignOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (userData) {
      const userWithTenant = await fetchUserWithTenant(userData.id);
      setUser(userWithTenant);
    }
  };

  return {
    user,
    isLoading: isLoading || authLoading,
    isAuthenticated: isAuthenticated && !!user,
    signOut,
    signIn,
    signUp,
    refreshUserData,
  };
};