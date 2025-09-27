// Tipos para o módulo de Dashboard

export interface DashboardStats {
  appointmentsToday: number;
  appointmentsWeek: number;
  totalPatients: number;
  totalProfessionals: number;
  waitingListCount: number;
  lowStockItems: number;
  whatsappMessagesToday?: number;
  aiLeadsToday?: number;
  aiConversionRate?: number;
}

export interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'material' | 'whatsapp' | 'ai_lead' | 'professional';
  description: string;
  timestamp: string;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface QuickAction {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  path: string;
  permissions: string[];
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  permissions: string[];
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AppointmentsByStatus {
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface AppointmentsByProfessional {
  professionalId: string;
  professionalName: string;
  count: number;
}

export interface DashboardChartData {
  appointmentsByStatus: AppointmentsByStatus;
  appointmentsByProfessional: AppointmentsByProfessional[];
  patientsGrowth: Array<{
    month: string;
    count: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}