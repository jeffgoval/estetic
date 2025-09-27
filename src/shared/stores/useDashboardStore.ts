import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  DashboardStats, 
  RecentActivity, 
  DashboardChartData 
} from '../features/dashboard/types';

interface DashboardState {
  // Data state
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  chartData: DashboardChartData | null;
  loading: boolean;
  error: string | null;
  
  // UI state
  refreshInterval: number; // em segundos
  lastRefresh: Date | null;
  autoRefresh: boolean;
  
  // Actions
  setStats: (stats: DashboardStats) => void;
  setRecentActivity: (activity: RecentActivity[]) => void;
  setChartData: (data: DashboardChartData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshInterval: (interval: number) => void;
  setAutoRefresh: (enabled: boolean) => void;
  updateLastRefresh: () => void;
  reset: () => void;
}

const initialState = {
  stats: null,
  recentActivity: [],
  chartData: null,
  loading: false,
  error: null,
  refreshInterval: 30, // 30 segundos por padrão
  lastRefresh: null,
  autoRefresh: true,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setStats: (stats) => set({ stats }),
      
      setRecentActivity: (recentActivity) => set({ recentActivity }),
      
      setChartData: (chartData) => set({ chartData }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      
      updateLastRefresh: () => set({ lastRefresh: new Date() }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'dashboard-store',
    }
  )
);