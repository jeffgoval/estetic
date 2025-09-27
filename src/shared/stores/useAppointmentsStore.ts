import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Appointment {
  id: string;
  tenantId: string;
  patientId: string;
  professionalId: string;
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  serviceType?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations (populated when needed)
  patient?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  professional?: {
    id: string;
    name: string;
    specialty?: string;
  };
}

interface AppointmentsState {
  // Data state
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  
  // Calendar view state
  currentDate: Date;
  viewMode: 'day' | 'week' | 'month';
  
  // Filter state
  filters: {
    professionalId?: string;
    patientId?: string;
    status?: Appointment['status'];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  
  // Actions
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  selectAppointment: (appointment: Appointment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  setFilters: (filters: Partial<AppointmentsState['filters']>) => void;
  reset: () => void;
}

const initialState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
  currentDate: new Date(),
  viewMode: 'week' as const,
  filters: {},
};

export const useAppointmentsStore = create<AppointmentsState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setAppointments: (appointments) => set({ appointments }),
      
      addAppointment: (appointment) => set((state) => ({
        appointments: [...state.appointments, appointment],
      })),
      
      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map(appointment =>
          appointment.id === id ? { ...appointment, ...updates } : appointment
        ),
        selectedAppointment: state.selectedAppointment?.id === id
          ? { ...state.selectedAppointment, ...updates }
          : state.selectedAppointment,
      })),
      
      removeAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter(appointment => appointment.id !== id),
        selectedAppointment: state.selectedAppointment?.id === id ? null : state.selectedAppointment,
      })),
      
      selectAppointment: (selectedAppointment) => set({ selectedAppointment }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setCurrentDate: (currentDate) => set({ currentDate }),
      setViewMode: (viewMode) => set({ viewMode }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters },
      })),
      reset: () => set(initialState),
    }),
    {
      name: 'appointments-store',
    }
  )
);