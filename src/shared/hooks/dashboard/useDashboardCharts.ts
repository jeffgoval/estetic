import { useDashboardStore } from '../../stores/useDashboardStore';
import { useDashboardData } from './useDashboardData';

export const useDashboardCharts = () => {
  const { chartData, loading, error } = useDashboardStore();
  const { refreshData } = useDashboardData();

  return {
    chartData,
    loading,
    error,
    refreshCharts: refreshData,
  };
};