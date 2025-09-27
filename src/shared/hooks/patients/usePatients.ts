import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { usePatientsStore } from '../../stores/usePatientsStore';
import { useTenant } from '../useTenant';
import type { Patient, CreatePatient } from '../../types';
import {
  GetPatientsDocument,
  GetPatientDocument,
  CreatePatientDocument,
  PatientsSubscriptionDocument,
  type GetPatientsQuery,
  type GetPatientQuery,
  type CreatePatientMutation,
  type CreatePatientMutationVariables,
  type PatientsSubscriptionSubscription,
} from '../../generated/graphql';

export const usePatients = () => {
  const store = usePatientsStore();
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
        { phone: { _ilike: `%${searchTerm}%` } },
        { email: { _ilike: `%${searchTerm}%` } }
      ];
    }

    return {
      where,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };
  }, [store, tenant?.id]);

  // Query para buscar pacientes
  const { data: patientsData, loading: queryLoading, error: queryError, refetch } = useQuery<GetPatientsQuery>(
    GetPatientsDocument,
    {
      variables: buildFilters(),
      skip: !tenant?.id,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  // Subscription para atualizações em tempo real
  const { data: subscriptionData } = useSubscription<PatientsSubscriptionSubscription>(
    PatientsSubscriptionDocument,
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

  // Mutations
  const [createPatientMutation, { loading: createLoading }] = useMutation<CreatePatientMutation, CreatePatientMutationVariables>(
    CreatePatientDocument,
    {
      onCompleted: (data) => {
        if (data.insert_patients_one) {
          store.addPatient(data.insert_patients_one as Patient);
        }
      },
      onError: (error) => {
        store.setError(error.message);
      },
    }
  );

  // Atualizar store quando dados chegarem
  useEffect(() => {
    if (patientsData?.patients) {
      store.setPatients(patientsData.patients as Patient[]);
      store.setTotalCount(patientsData.patients_aggregate?.aggregate?.count || 0);
    }
  }, [patientsData, store]);

  // Atualizar store com dados da subscription
  useEffect(() => {
    if (subscriptionData?.patients) {
      store.setPatients(subscriptionData.patients as Patient[]);
    }
  }, [subscriptionData, store]);

  // Atualizar estado de loading e error
  useEffect(() => {
    store.setLoading(queryLoading);
    store.setError(queryError?.message || null);
  }, [queryLoading, queryError, store]);

  // Buscar pacientes (refetch)
  const fetchPatients = useCallback(async () => {
    try {
      await refetch(buildFilters());
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  }, [refetch, buildFilters]);

  // Criar paciente
  const createPatient = useCallback(async (patientData: CreatePatient): Promise<Patient> => {
    try {
      const result = await createPatientMutation({
        variables: {
          object: {
            ...patientData,
            tenant_id: tenant?.id,
          }
        }
      });

      if (result.data?.insert_patients_one) {
        return result.data.insert_patients_one as Patient;
      }

      throw new Error('Erro ao criar paciente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar paciente';
      throw new Error(errorMessage);
    }
  }, [createPatientMutation, tenant?.id]);

  // Buscar paciente por ID
  const getPatientById = useCallback(async (id: string): Promise<Patient | null> => {
    try {
      // Implementar query individual quando necessário
      const patient = store.patients.find(p => p.id === id);
      return patient || null;
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      return null;
    }
  }, [store.patients]);

  // Refetch quando filtros mudarem
  useEffect(() => {
    if (tenant?.id) {
      fetchPatients();
    }
  }, [store.searchTerm, store.filters, store.currentPage, store.pageSize, tenant?.id]);

  return {
    // Estado
    patients: store.patients,
    selectedPatient: store.selectedPatient,
    loading: store.loading || queryLoading || createLoading,
    error: store.error,
    searchTerm: store.searchTerm,
    filters: store.filters,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    totalCount: store.totalCount,
    totalPages: Math.ceil(store.totalCount / store.pageSize),

    // Ações
    fetchPatients,
    createPatient,
    getPatientById,

    // Ações do store
    selectPatient: store.selectPatient,
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