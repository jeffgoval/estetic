import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
}

interface UIState {
  // Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Tema
  theme: 'light' | 'dark' | 'system';
  
  // Toasts
  toasts: Toast[];
  
  // Modais
  modals: Modal[];
  
  // Loading states globais
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Ações - Layout
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  
  // Ações - Tema
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Ações - Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Ações - Modais
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Ações - Loading
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  getLoadingState: (key: string) => boolean;
  clearLoadingStates: () => void;
  
  // Utilitários
  showSuccessToast: (title: string, message?: string) => void;
  showErrorToast: (title: string, message?: string) => void;
  showWarningToast: (title: string, message?: string) => void;
  showInfoToast: (title: string, message?: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        sidebarOpen: true,
        sidebarCollapsed: false,
        theme: 'light',
        toasts: [],
        modals: [],
        globalLoading: false,
        loadingStates: {},
        
        // Ações - Layout
        setSidebarOpen: (sidebarOpen) => 
          set({ sidebarOpen }, false, 'setSidebarOpen'),
        
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        
        setSidebarCollapsed: (sidebarCollapsed) =>
          set({ sidebarCollapsed }, false, 'setSidebarCollapsed'),
        
        toggleSidebarCollapsed: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'toggleSidebarCollapsed'),
        
        // Ações - Tema
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light'
          }), false, 'toggleTheme'),
        
        // Ações - Toasts
        addToast: (toast) => {
          const id = generateId();
          const newToast = { ...toast, id };
          
          set((state) => ({
            toasts: [...state.toasts, newToast]
          }), false, 'addToast');
          
          // Auto-remover toast após duração especificada
          if (toast.duration !== 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, toast.duration || 5000);
          }
        },
        
        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter(toast => toast.id !== id)
          }), false, 'removeToast'),
        
        clearToasts: () => set({ toasts: [] }, false, 'clearToasts'),
        
        // Ações - Modais
        openModal: (modal) => {
          const id = generateId();
          const newModal = { ...modal, id };
          
          set((state) => ({
            modals: [...state.modals, newModal]
          }), false, 'openModal');
        },
        
        closeModal: (id) =>
          set((state) => ({
            modals: state.modals.filter(modal => modal.id !== id)
          }), false, 'closeModal'),
        
        closeAllModals: () => set({ modals: [] }, false, 'closeAllModals'),
        
        // Ações - Loading
        setGlobalLoading: (globalLoading) =>
          set({ globalLoading }, false, 'setGlobalLoading'),
        
        setLoadingState: (key, loading) =>
          set((state) => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading
            }
          }), false, 'setLoadingState'),
        
        getLoadingState: (key) => {
          const { loadingStates } = get();
          return loadingStates[key] || false;
        },
        
        clearLoadingStates: () => set({ loadingStates: {} }, false, 'clearLoadingStates'),
        
        // Utilitários para toasts
        showSuccessToast: (title, message) =>
          get().addToast({ type: 'success', title, message }),
        
        showErrorToast: (title, message) =>
          get().addToast({ type: 'error', title, message, duration: 7000 }),
        
        showWarningToast: (title, message) =>
          get().addToast({ type: 'warning', title, message }),
        
        showInfoToast: (title, message) =>
          get().addToast({ type: 'info', title, message }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);