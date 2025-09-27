import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Professional } from '../types';

interface ProfessionalsState {
  // Estado
  professionals: Professional[];
  selectedProfessional: Professional | null;
  loading: boolean;
  error: string | null;
  
  // Filtros e busca
  searchTerm: string;
  filters: {
    specialty?: string;
    isActive?: boolean;
  };
  
  // Paginação
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Ações
  setProfessionals: (professionals: Professional[]) => void;
  addProfessional: (professional: Professional) => void;
  updateProfessional: (id: string, updates: Partial<Professional>) => void;
  removeProfessional: (id: string) => void;
  selectProfessional: (professional: Professional | null) => void;
  
  // Estados de carregamento
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filtros e busca
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<ProfessionalsState['filters']>) => void;
  clearFilters: () => void;
  
  // Paginação
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setTotalItems: (total: number) => void;
  
  // Utilitários
  getFilteredProfessionals: () => Professional[];
  getPaginatedProfessionals: () => Professional[];
  reset: () => void;
}

const initialState = {
  professionals: [],
  selectedProfessional: null,
  loading: false,
  error: null,
  searchTerm: '',
  filters: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

export const useProfessionalsStore = create<ProfessionalsState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Ações básicas
      setProfessionals: (professionals) => 
        set({ professionals, totalItems: professionals.length }, false, 'setProfessionals'),
      
      addProfessional: (professional) =>
        set((state) => ({
          professionals: [...state.professionals, professional],
          totalItems: state.totalItems + 1,
        }), false, 'addProfessional'),
      
      updateProfessional: (id, updates) =>
        set((state) => ({
          professionals: state.professionals.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
          selectedProfessional: state.selectedProfessional?.id === id
            ? { ...state.selectedProfessional, ...updates }
            : state.selectedProfessional,
        }), false, 'updateProfessional'),
      
      removeProfessional: (id) =>
        set((state) => ({
          professionals: state.professionals.filter(p => p.id !== id),
          selectedProfessional: state.selectedProfessional?.id === id ? null : state.selectedProfessional,
          totalItems: state.totalItems - 1,
        }), false, 'removeProfessional'),
      
      selectProfessional: (professional) =>
        set({ selectedProfessional: professional }, false, 'selectProfessional'),
      
      // Estados de carregamento
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),
      
      // Filtros e busca
      setSearchTerm: (searchTerm) =>
        set({ searchTerm, currentPage: 1 }, false, 'setSearchTerm'),
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        }), false, 'setFilters'),
      
      clearFilters: () =>
        set({ filters: {}, searchTerm: '', currentPage: 1 }, false, 'clearFilters'),
      
      // Paginação
      setCurrentPage: (currentPage) => set({ currentPage }, false, 'setCurrentPage'),
      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }, false, 'setItemsPerPage'),
      setTotalItems: (totalItems) => set({ totalItems }, false, 'setTotalItems'),
      
      // Utilitários
      getFilteredProfessionals: () => {
        const { professionals, searchTerm, filters } = get();
        
        return professionals.filter(professional => {
          // Filtro de busca
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
              professional.name.toLowerCase().includes(searchLower) ||
              professional.specialty?.toLowerCase().includes(searchLower) ||
              professional.email?.toLowerCase().includes(searchLower) ||
              professional.phone?.includes(searchTerm);
            
            if (!matchesSearch) return false;
          }
          
          // Filtros específicos
          if (filters.specialty && professional.specialty !== filters.specialty) {
            return false;
          }
          
          if (filters.isActive !== undefined && professional.isActive !== filters.isActive) {
            return false;
          }
          
          return true;
        });
      },
      
      getPaginatedProfessionals: () => {
        const { currentPage, itemsPerPage } = get();
        const filtered = get().getFilteredProfessionals();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return filtered.slice(startIndex, endIndex);
      },
      
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'professionals-store',
    }
  )
);