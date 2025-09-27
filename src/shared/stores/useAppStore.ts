import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'owner' | 'admin' | 'professional' | 'receptionist';
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  planId?: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Auth state
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  reset: () => void;
}

const initialState = {
  user: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: true,
  sidebarOpen: true,
  theme: 'light' as const,
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      reset: () => set(initialState),
    }),
    {
      name: 'app-store',
    }
  )
);