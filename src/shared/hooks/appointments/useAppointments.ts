import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useAppointmentsStore } from '../../stores/useAppointmentsStore';
import { useTenant } from '../useTenant';
import type { Appointment } from '../../types';
import {
  GetAppointmentsDocument,
  CreateAppointmentDocument,
  AppointmentsSubscriptionDocument,
  type GetAppointmentsQuery,
  type CreateAppointmentMutation,
  type CreateAppointmentMutationVariables,
  type AppointmentsSubscriptionSubscription,
} from '../../generated/graphql';

export const useAppointments = (filters?: {
  professionalId?: string;
  patientId?: string;
  status?: string;
  dateRange?: { start: string; end: string };
}) => {
  const store = useAppointmentsStore();
  const { tenant } = useTenant();

  // Construir filtros baseados nos parâmetros
  const buildFilters = useCallback(() => {
    const where: any = {
      tenant_id: { _eq: tenant?.id }
    };

    if (filters?.professionalId) {
      where.professional_id = { _eq: filters.professionalId };
    }
    if (filters?.patientId) {
      where.patient_id = { _eq: filters.patientId };
    }
    if (filters?.status) {
      where.status = { _eq: filters.status };
    }
    if (filters?.dateRange) {
      where.start_datetime = {
        _gte: filters.dateRange.start,
        _lte: filters.dateRange.end
      };
    }

    return { where };
  }, [filters, tenant?.id]);

  // Query para buscar agendamentos
  const { data: appointmentsData, loading: queryLoading, error: queryError, refetch } = useQuery<GetAppointmentsQuery>(
    GetAppointmentsDocument,
    {
      variables: buildFilters(),
      skip: !tenant?.id,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  // Subscription para atualizações em tempo real
  const { data: subscriptionData } = useSubscription<AppointmentsSubscriptionSubscription>(
    AppointmentsSubscriptionDocument,
    {
      variables: buildFilters(),
      skip: !tenant?.id,
    }
  );

  // Mutation para criar agendamento
  const [createAppointmentMutation, { loading: createLoading }] = useMutation<CreateAppointmentMutation, CreateAppointmentMutationVariables>(
    CreateAppointmentDocument,
    {
      onCompleted: (data) => {
        if (data.insert_appointments_one) {
          store.addAppointment(data.insert_appointments_one as Appointment);
        }
      },
      onError: (error) => {
        store.setError(error.message);
      },
    }
  );

  // Atualizar store quando dados chegarem
  useEffect(() => {
    if (appointmentsData?.appointments) {
      store.setAppointments(appointmentsData.appointments as Appointment[]);
    }
  }, [appointmentsData, store]);

  // Atualizar store com dados da subscription
  useEffect(() => {
    if (subscriptionData?.appointments) {
      store.setAppointments(subscriptionData.appointments as Appointment[]);
    }
  }, [subscriptionData, store]);

  // Atualizar estado de loading e error
  useEffect(() => {
    store.setLoading(queryLoading);
    store.setError(queryError?.message || null);
  }, [queryLoading, queryError, store]);

  // Criar agendamento
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    try {
      const result = await createAppointmentMutation({
        variables: {
          object: {
            ...appointmentData,
            tenant_id: tenant?.id,
          }
        }
      });

      if (result.data?.insert_appointments_one) {
        return result.data.insert_appointments_one as Appointment;
      }

      throw new Error('Erro ao criar agendamento');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar agendamento';
      throw new Error(errorMessage);
    }
  }, [createAppointmentMutation, tenant?.id]);

  // Refetch agendamentos
  const fetchAppointments = useCallback(async () => {
    try {
      await refetch(buildFilters());
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  }, [refetch, buildFilters]);

  return {
    // Estado
    appointments: store.appointments,
    selectedAppointment: store.selectedAppointment,
    loading: store.loading || queryLoading || createLoading,
    error: store.error,
    currentDate: store.currentDate,
    viewMode: store.viewMode,
    filters: store.filters,

    // Ações
    fetchAppointments,
    createAppointment,

    // Ações do store
    selectAppointment: store.selectAppointment,
    setCurrentDate: store.setCurrentDate,
    setViewMode: store.setViewMode,
    setFilters: store.setFilters,
    reset: store.reset,

    // Dados da query
    refetch,
    queryLoading,
    queryError,
  };
};