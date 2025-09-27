import { useCallback, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useTenant } from '../useTenant';
import {
  GetDashboardMetricsDocument,
  DashboardMetricsSubscriptionDocument,
  type GetDashboardMetricsQuery,
  type DashboardMetricsSubscriptionSubscription,
} from '../../generated/graphql';

/**
 * Hook para gerenciar dados do dashboard com GraphQL
 * Fornece métricas, estatísticas e dados em tempo real
 */
export const useDashboard = (dateRange?: { start: string; end: string }) => {
  const store = useDashboardStore();
  const { tenant } = useTenant();

  // Definir período padrão (hoje)
  const defaultDateRange = {
    start: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    end: new Date().toISOString().split('T')[0] + 'T23:59:59Z',
  };

  const currentDateRange = dateRange || defaultDateRange;

  // Query para buscar métricas do dashboard
  const { data: metricsData, loading: queryLoading, error: queryError, refetch } = useQuery<GetDashboardMetricsQuery>(
    GetDashboardMetricsDocument,
    {
      variables: {
        tenant_id: tenant?.id,
        start_date: currentDateRange.start,
        end_date: currentDateRange.end,
      },
      skip: !tenant?.id,
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      pollInterval: 30000, // Atualizar a cada 30 segundos
    }
  );

  // Subscription para atualizações em tempo real
  const { data: subscriptionData } = useSubscription<DashboardMetricsSubscriptionSubscription>(
    DashboardMetricsSubscriptionDocument,
    {
      variables: {
        tenant_id: tenant?.id,
      },
      skip: !tenant?.id,
    }
  );

  // Processar dados das métricas
  const processMetrics = useCallback((data: GetDashboardMetricsQuery) => {
    const metrics = {
      totalPatients: data.patients_aggregate?.aggregate?.count || 0,
      totalProfessionals: data.professionals_aggregate?.aggregate?.count || 0,
      totalAppointments: data.appointments_aggregate?.aggregate?.count || 0,
      todayAppointments: data.today_appointments || [],
      lowStockMaterials: data.low_stock_materials || [],
      waitingListCount: data.waiting_list_aggregate?.aggregate?.count || 0,
    };

    // Processar status dos agendamentos
    const appointmentsByStatus = data.appointments_by_status?.nodes?.reduce((acc: any, appointment: any) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      ...metrics,
      appointmentsByStatus,
    };
  }, []);

  // Atualizar store quando dados chegarem
  useEffect(() => {
    if (metricsData) {
      const processedMetrics = processMetrics(metricsData);
      store.setMetrics(processedMetrics);
    }
  }, [metricsData, processMetrics, store]);

  // Atualizar store com dados da subscription
  useEffect(() => {
    if (subscriptionData) {
      // Atualizar apenas dados em tempo real específicos
      store.setTodayAppointments(subscriptionData.appointments || []);
      store.setLowStockMaterials(subscriptionData.materials || []);
    }
  }, [subscriptionData, store]);

  // Atualizar estado de loading e error
  useEffect(() => {
    store.setLoading(queryLoading);
    store.setError(queryError?.message || null);
  }, [queryLoading, queryError, store]);

  // Refetch métricas
  const fetchMetrics = useCallback(async () => {
    try {
      await refetch({
        tenant_id: tenant?.id,
        start_date: currentDateRange.start,
        end_date: currentDateRange.end,
      });
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  }, [refetch, tenant?.id, currentDateRange]);

  // Atualizar quando período mudar
  useEffect(() => {
    if (tenant?.id) {
      fetchMetrics();
    }
  }, [currentDateRange.start, currentDateRange.end, tenant?.id]);

  return {
    // Estado
    metrics: store.metrics,
    todayAppointments: store.todayAppointments,
    lowStockMaterials: store.lowStockMaterials,
    loading: store.loading || queryLoading,
    error: store.error,

    // Ações
    fetchMetrics,
    setDateRange: store.setDateRange,
    reset: store.reset,

    // Dados da query
    refetch,
    queryLoading,
    queryError,

    // Dados processados
    stats: {
      totalPatients: store.metrics?.totalPatients || 0,
      totalProfessionals: store.metrics?.totalProfessionals || 0,
      totalAppointments: store.metrics?.totalAppointments || 0,
      waitingListCount: store.metrics?.waitingListCount || 0,
      lowStockCount: store.lowStockMaterials?.length || 0,
      todayAppointmentsCount: store.todayAppointments?.length || 0,
    },

    // Status dos agendamentos
    appointmentsByStatus: store.metrics?.appointmentsByStatus || {},
  };
};