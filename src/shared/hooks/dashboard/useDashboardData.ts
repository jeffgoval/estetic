import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useApi } from '../useApi';
import type { DashboardStats, RecentActivity, DashboardChartData } from '../../features/dashboard/types';

export const useDashboardData = () => {
  const {
    stats,
    recentActivity,
    chartData,
    loading,
    error,
    autoRefresh,
    refreshInterval,
    setStats,
    setRecentActivity,
    setChartData,
    setLoading,
    setError,
    updateLastRefresh,
  } = useDashboardStore();

  const { get } = useApi();

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await get<DashboardStats>('/dashboard/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      setError('Erro ao carregar estatísticas');
    }
  }, [get, setStats, setError]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await get<RecentActivity[]>('/dashboard/activity');
      if (response.data) {
        setRecentActivity(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error);
      setError('Erro ao carregar atividades');
    }
  }, [get, setRecentActivity, setError]);

  const fetchChartData = useCallback(async () => {
    try {
      const response = await get<DashboardChartData>('/dashboard/charts');
      if (response.data) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error);
      setError('Erro ao carregar gráficos');
    }
  }, [get, setChartData, setError]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity(),
        fetchChartData(),
      ]);
      updateLastRefresh();
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [
    fetchDashboardStats,
    fetchRecentActivity,
    fetchChartData,
    setLoading,
    setError,
    updateLastRefresh,
  ]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchAllData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAllData]);

  return {
    stats,
    recentActivity,
    chartData,
    loading,
    error,
    refreshData,
    fetchDashboardStats,
    fetchRecentActivity,
    fetchChartData,
  };
};