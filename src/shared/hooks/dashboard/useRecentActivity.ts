import { useDashboardStore } from '../../stores/useDashboardStore';
import { useDashboardData } from './useDashboardData';

export const useRecentActivity = () => {
  const { recentActivity, loading, error } = useDashboardStore();
  const { refreshData } = useDashboardData();

  return {
    activities: recentActivity,
    loading,
    error,
    refreshActivity: refreshData,
  };
};