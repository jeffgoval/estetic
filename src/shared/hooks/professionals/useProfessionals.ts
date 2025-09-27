import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useProfessionalsStore } from '../../stores/useProfessionalsStore';
import { useTenant } from '../useTenant';
import type { Professional } from '../../types';
import {
  GetProfessionalsDocument,
  CreateProfessionalDocument,
  ProfessionalsSubscriptionDocument,
  type GetProfessionalsQuery,
  type CreateProfessionalMutation,
  type CreateProfessionalMutationVariables,
  type ProfessionalsSubscriptionSubscription,
} from '../../generated/graphql';

/**
 * Hook para gerenciar profissionais com GraphQL
 * Fornece dados, estado de carregamento e funções para buscar profissionais
 */
export const useProfessionals = () => {
  const store = useProfessionalsStore();
  const { tenant } = useTenant();

  // Construir filtros baseados no estado do store
  const buildFilters = useCallback(() => {
    const { searchTerm, filters, currentPage, itemsPerPage } = store;
    
    const where: any = {
      tenant_id: { _eq: tenant?.id },
      is_active: { _eq: filters.isActive ?? true }
    };

    // Adicionar filtro de busca
    if (searchTerm.trim()) {
      where._or = [
        { name: { _ilike: `%${searchTerm}%` } },
        { specialty: { _ilike: `%${searchTerm}%` } },
        { email: { _ilike: `%${searchTerm}%` } }
      ];
    }

    // Filtro por especialidade
    if (filters.specialty) {
      where.specialty = { _eq: filters.specialty };
    }

    return {
      where,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    };
  }, [store, tenant?.id]);

  // Query para buscar profissionais
  const { data: professionalsData, loading: queryLoading, error: queryError, refetch } = useQuery<GetProfessionalsQuery>(
    GetProfessionalsDocument,
    {
      variables: buildFilters(),
      skip: !tenant?.id,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  // Subscription para atualizações em tempo real
  const { data: subscriptionData } = useSubscription<ProfessionalsSubscriptionSubscription>(
    ProfessionalsSubscriptionDocument,
    {
      variables: {
        where: {
          tenant_id: { _eq: tenant?.id },
          is_active: { _eq: true }
        }
      },
      skip: !tenant?.id,
    }
  );

  // Mutation para criar profissional
  const [createProfessionalMutation, { loading: createLoading }] = useMutation<CreateProfessionalMutation, CreateProfessionalMutationVariables>(
    CreateProfessionalDocument,
    {
      onCompleted: (data) => {
        if (data.insert_professionals_one) {
          store.addProfessional(data.insert_professionals_one as Professional);
        }
      },
      onError: (error) => {
        store.setError(error.message);
      },
    }
  );

  // Atualizar store quando dados chegarem
  useEffect(() => {
    if (professionalsData?.professionals) {
      store.setProfessionals(professionalsData.professionals as Professional[]);
      store.setTotalItems(professionalsData.professionals_aggregate?.aggregate?.count || 0);
    }
  }, [professionalsData, store]);

  // Atualizar store com dados da subscription
  useEffect(() => {
    if (subscriptionData?.professionals) {
      store.setProfessionals(subscriptionData.professionals as Professional[]);
    }
  }, [subscriptionData, store]);

  // Atualizar estado de loading e error
  useEffect(() => {
    store.setLoading(queryLoading);
    store.setError(queryError?.message || null);
  }, [queryLoading, queryError, store]);

  // Buscar profissionais (refetch)
  const fetchProfessionals = useCallback(async () => {
    try {
      await refetch(buildFilters());
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  }, [refetch, buildFilters]);

  // Criar profissional
  const createProfessional = useCallback(async (professionalData: Omit<Professional, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Professional> => {
    try {
      const result = await createProfessionalMutation({
        variables: {
          object: {
            ...professionalData,
            tenant_id: tenant?.id,
          }
        }
      });

      if (result.data?.insert_professionals_one) {
        return result.data.insert_professionals_one as Professional;
      }

      throw new Error('Erro ao criar profissional');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar profissional';
      throw new Error(errorMessage);
    }
  }, [createProfessionalMutation, tenant?.id]);

  // Refetch quando filtros mudarem
  useEffect(() => {
    if (tenant?.id) {
      fetchProfessionals();
    }
  }, [store.searchTerm, store.filters, store.currentPage, store.itemsPerPage, tenant?.id]);

  // Dados filtrados e paginados (usando store)
  const filteredProfessionals = store.getFilteredProfessionals();
  const paginatedProfessionals = store.getPaginatedProfessionals();
  
  // Estatísticas
  const stats = {
    total: store.professionals.length,
    active: store.professionals.filter(p => p.isActive).length,
    inactive: store.professionals.filter(p => !p.isActive).length,
    filtered: filteredProfessionals.length,
  };

  return {
    // Dados
    professionals: paginatedProfessionals,
    allProfessionals: store.professionals,
    selectedProfessional: store.selectedProfessional,
    
    // Estado
    loading: store.loading || queryLoading || createLoading,
    error: store.error,
    
    // Filtros e busca
    searchTerm: store.searchTerm,
    filters: store.filters,
    
    // Paginação
    currentPage: store.currentPage,
    itemsPerPage: store.itemsPerPage,
    totalItems: store.totalItems,
    totalPages: Math.ceil(store.totalItems / store.itemsPerPage),
    
    // Estatísticas
    stats,
    
    // Ações
    fetchProfessionals,
    createProfessional,
    refetch: fetchProfessionals,

    // Ações do store
    selectProfessional: store.selectProfessional,
    setSearchTerm: store.setSearchTerm,
    setFilters: store.setFilters,
    setCurrentPage: store.setCurrentPage,
    setItemsPerPage: store.setItemsPerPage,
    clearFilters: store.clearFilters,
    reset: store.reset,

    // Dados da query
    queryLoading,
    queryError,
  };
};