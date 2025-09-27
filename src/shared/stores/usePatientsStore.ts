import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Importar o tipo Patient do arquivo de tipos compartilhado
import type { Patient } from '../types';

interface PatientsState {
  // Data state
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  
  // Filter and search state
  searchTerm: string;
  filters: {
    isActive?: boolean;
  };
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalCount: number;
  
  // Actions
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  removePatient: (id: string) => void;
  selectPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  setFilters: (filters: Partial<PatientsState['filters']>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  reset: () => void;
}

const initialState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  searchTerm: '',
  filters: {},
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
};

export const usePatientsStore = create<PatientsState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setPatients: (patients) => set({ patients }),
      
      addPatient: (patient) => set((state) => ({
        patients: [patient, ...state.patients],
        totalCount: state.totalCount + 1,
      })),
      
      updatePatient: (id, updates) => set((state) => ({
        patients: state.patients.map(patient =>
          patient.id === id ? { ...patient, ...updates } : patient
        ),
        selectedPatient: state.selectedPatient?.id === id
          ? { ...state.selectedPatient, ...updates }
          : state.selectedPatient,
      })),
      
      removePatient: (id) => set((state) => ({
        patients: state.patients.filter(patient => patient.id !== id),
        selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
        totalCount: Math.max(0, state.totalCount - 1),
      })),
      
      selectPatient: (selectedPatient) => set({ selectedPatient }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters },
        currentPage: 1,
      })),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
      setTotalCount: (totalCount) => set({ totalCount }),
      reset: () => set(initialState),
    }),
    {
      name: 'patients-store',
    }
  )
);