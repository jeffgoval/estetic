import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useMaterialsStore } from '../../stores/useMaterialsStore';
import { useTenant } from '../useTenant';
import type { Material } from '../../types';
import {
  GetMaterialsDocument,
  CreateMaterialDocument,
  MaterialsSubscriptionDocument,
  type GetMaterialsQuery,
  type CreateMaterialMutation,
  type CreateMaterialMutationVariables,
  type MaterialsSubscriptionSubscription,
} from '../../generated/graphql';

/**
 * Hook para gerenciar materiais com GraphQL
 * Fornece dados, estado de carregamento e funções para buscar materiais
 */
export const useMaterials = () => {
  const store = useMaterialsStore();
  const { tenant } = useTenant();

  // Construir filtros baseados no estado do store
  const buildFilters = useCallback(() => {
    const { searchTerm, filters, currentPage, pageSize } = store;
    
    const where: any = {
      tenant_id: { _eq: tenant?.id },
      is_active: { _eq: filters.isActive ?? true }
    };

    // Adicionar filtro de busca
    if (searchTerm.trim()) {
      where._or = [
        { name: { _ilike: `%${searchTerm}%` } },
        { brand: { _ilike: `%${searchTerm}%` } },
        { description: { _ilike: `%${searchTerm}%` } }
      ];
    }

    // Filtro por categoria
    if (filters.categoryId) {
      where.category_id = { _eq: filters.categoryId };
    }

    // Filtro por estoque baixo
    if (filters.lowStock) {
      where.current_stock = { _lte: { min_stock_level: {} } };
    }

    return {
      where,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };
  }, [store, tenant?.id]);

  // Query para buscar materiais
  const { data: materialsData, loading: queryLoading, error: queryError, refetch } = useQuery<GetMaterialsQuery>(
    GetMaterialsDocument,
    {
      variables: buildFilters(),
      skip: !tenant?.id,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  // Subscription para atualizações em tempo real
  const { data: subscriptionData } = useSubscription<MaterialsSubscriptionSubscription>(
    MaterialsSubscriptionDocument,
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

  // Mutation para criar material
  const [createMaterialMutation, { loading: createLoading }] = useMutation<CreateMaterialMutation, CreateMaterialMutationVariables>(
    CreateMaterialDocument,
    {
      onCompleted: (data) => {
        if (data.insert_materials_one) {
          store.addMaterial(data.insert_materials_one as Material);
        }
      },
      onError: (error) => {
        store.setError(error.message);
      },
    }
  );

  // Atualizar store quando dados chegarem
  useEffect(() => {
    if (materialsData?.materials) {
      store.setMaterials(materialsData.materials as Material[]);
      store.setTotalCount(materialsData.materials_aggregate?.aggregate?.count || 0);
    }
  }, [materialsData, store]);

  // Atualizar store com dados da subscription
  useEffect(() => {
    if (subscriptionData?.materials) {
      store.setMaterials(subscriptionData.materials as Material[]);
    }
  }, [subscriptionData, store]);

  // Atualizar estado de loading e error
  useEffect(() => {
    store.setLoading(queryLoading);
    store.setError(queryError?.message || null);
  }, [queryLoading, queryError, store]);

  // Buscar materiais (refetch)
  const fetchMaterials = useCallback(async () => {
    try {
      await refetch(buildFilters());
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
    }
  }, [refetch, buildFilters]);

  // Criar material
  const createMaterial = useCallback(async (materialData: Omit<Material, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Material> => {
    try {
      const result = await createMaterialMutation({
        variables: {
          object: {
            ...materialData,
            tenant_id: tenant?.id,
          }
        }
      });

      if (result.data?.insert_materials_one) {
        return result.data.insert_materials_one as Material;
      }

      throw new Error('Erro ao criar material');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar material';
      throw new Error(errorMessage);
    }
  }, [createMaterialMutation, tenant?.id]);

  // Refetch quando filtros mudarem
  useEffect(() => {
    if (tenant?.id) {
      fetchMaterials();
    }
  }, [store.searchTerm, store.filters, store.currentPage, store.pageSize, tenant?.id]);

  // Estatísticas
  const stats = {
    total: store.materials.length,
    active: store.materials.filter(m => m.isActive).length,
    lowStock: store.materials.filter(m => m.currentStock <= m.minStockLevel).length,
    outOfStock: store.materials.filter(m => m.currentStock === 0).length,
  };

  return {
    // Estado
    materials: store.materials,
    selectedMaterial: store.selectedMaterial,
    loading: store.loading || queryLoading || createLoading,
    error: store.error,
    searchTerm: store.searchTerm,
    filters: store.filters,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    totalCount: store.totalCount,
    totalPages: Math.ceil(store.totalCount / store.pageSize),

    // Estatísticas
    stats,

    // Ações
    fetchMaterials,
    createMaterial,

    // Ações do store
    selectMaterial: store.selectMaterial,
    setSearchTerm: store.setSearchTerm,
    setFilters: store.setFilters,
    setCurrentPage: store.setCurrentPage,
    setPageSize: store.setPageSize,
    reset: store.reset,

    // Dados da query
    refetch,
    queryLoading,
    queryError,
  };
};