import { useMemo } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useDashboardData } from './useDashboardData';
import { PERMISSIONS } from '../../permissions';
import type { DashboardMetric } from '../../features/dashboard/types';

export const useDashboardStats = () => {
  const { stats, loading, error } = useDashboardStore();
  const { refreshData } = useDashboardData();

  const metrics = useMemo((): DashboardMetric[] => {
    if (!stats) return [];

    return [
      {
        id: 'appointments-today',
        title: 'Consultas Hoje',
        value: stats.appointmentsToday,
        icon: 'Calendar',
        color: 'primary',
        trend: stats.appointmentsWeek > 0 ? {
          value: stats.appointmentsWeek,
          label: `${stats.appointmentsWeek} esta semana`,
          isPositive: true,
        } : undefined,
        permissions: [PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN],
      },
      {
        id: 'total-patients',
        title: 'Total de Pacientes',
        value: stats.totalPatients,
        icon: 'Users',
        color: 'secondary',
        trend: {
          value: 0,
          label: 'Crescimento mensal',
          isPositive: true,
        },
        permissions: [PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.PATIENT_VIEW_OWN],
      },
      {
        id: 'total-professionals',
        title: 'Profissionais',
        value: stats.totalProfessionals,
        icon: 'UserCheck',
        color: 'secondary',
        permissions: [PERMISSIONS.PROFESSIONAL_VIEW_ALL],
      },
      {
        id: 'waiting-list',
        title: 'Lista de Espera',
        value: stats.waitingListCount,
        icon: 'Clock',
        color: 'warning',
        trend: {
          value: stats.waitingListCount,
          label: 'Aguardando agendamento',
          isPositive: false,
        },
        permissions: [PERMISSIONS.WAITING_LIST_VIEW],
      },
      {
        id: 'low-stock',
        title: 'Itens em Falta',
        value: stats.lowStockItems,
        icon: 'AlertTriangle',
        color: 'error',
        trend: stats.lowStockItems > 0 ? {
          value: stats.lowStockItems,
          label: 'Requer atenção',
          isPositive: false,
        } : undefined,
        permissions: [PERMISSIONS.INVENTORY_VIEW],
      },
      // Métricas opcionais (WhatsApp e IA)
      ...(stats.whatsappMessagesToday !== undefined ? [{
        id: 'whatsapp-messages',
        title: 'Mensagens WhatsApp',
        value: stats.whatsappMessagesToday,
        icon: 'MessageSquare',
        color: 'success',
        trend: {
          value: stats.whatsappMessagesToday,
          label: 'hoje',
          isPositive: true,
        },
        permissions: [PERMISSIONS.WHATSAPP_VIEW],
      }] : []),
      ...(stats.aiLeadsToday !== undefined ? [{
        id: 'ai-leads',
        title: 'Novos Leads IA',
        value: stats.aiLeadsToday,
        icon: 'Bot',
        color: 'primary',
        trend: {
          value: stats.aiLeadsToday,
          label: 'hoje',
          isPositive: true,
        },
        permissions: [PERMISSIONS.AI_LEADS_VIEW],
      }] : []),
      ...(stats.aiConversionRate !== undefined ? [{
        id: 'ai-conversion',
        title: 'Taxa de Conversão IA',
        value: `${stats.aiConversionRate}%`,
        icon: 'TrendingUp',
        color: 'primary',
        trend: {
          value: stats.aiConversionRate,
          label: 'este mês',
          isPositive: stats.aiConversionRate > 0,
        },
        permissions: [PERMISSIONS.AI_AGENT_VIEW],
      }] : []),
    ];
  }, [stats]);

  return {
    metrics,
    stats,
    loading,
    error,
    refreshStats: refreshData,
  };
};