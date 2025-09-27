// Constantes globais da aplicação

export const APP_CONFIG = {
  name: 'Sistema de Gestão Clínica',
  version: '1.0.0',
  description: 'Sistema moderno para gestão de clínicas de estética',
  
  // URLs e endpoints
  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:1337',
    graphqlUrl: process.env.VITE_GRAPHQL_URL || 'http://localhost:1337/v1/graphql',
    storageUrl: process.env.VITE_STORAGE_URL || 'http://localhost:1337/v1/storage',
  },
  
  // Configurações de paginação
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    maxPageSize: 100,
  },
  
  // Configurações de upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // Configurações de data/hora
  datetime: {
    defaultTimezone: 'America/Sao_Paulo',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    datetimeFormat: 'dd/MM/yyyy HH:mm',
  },
  
  // Configurações de agendamento
  appointment: {
    defaultDuration: 60, // minutos
    minDuration: 15,
    maxDuration: 480, // 8 horas
    workingHours: {
      start: '08:00',
      end: '18:00',
    },
    workingDays: [1, 2, 3, 4, 5, 6], // Segunda a sábado
  },
  
  // Status de agendamento
  appointmentStatus: {
    scheduled: { label: 'Agendado', color: '#3B82F6' },
    confirmed: { label: 'Confirmado', color: '#10B981' },
    in_progress: { label: 'Em Andamento', color: '#F59E0B' },
    completed: { label: 'Concluído', color: '#059669' },
    cancelled: { label: 'Cancelado', color: '#EF4444' },
    no_show: { label: 'Não Compareceu', color: '#6B7280' },
  },
  
  // Configurações de estoque
  inventory: {
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    defaultUnit: 'unidade',
    units: [
      'unidade',
      'ml',
      'mg',
      'g',
      'kg',
      'litro',
      'caixa',
      'frasco',
      'ampola',
      'seringa',
    ],
  },
  
  // Configurações de notificação
  notifications: {
    defaultDuration: 5000, // 5 segundos
    errorDuration: 7000, // 7 segundos
    maxToasts: 5,
  },
  
  // Configurações de tema
  theme: {
    defaultTheme: 'light',
    storageKey: 'clinic-theme',
  },
  
  // Configurações de cache
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxSize: 100, // máximo de itens no cache
  },
  
  // Configurações de validação
  validation: {
    minPasswordLength: 8,
    maxNameLength: 100,
    maxDescriptionLength: 500,
    maxNotesLength: 1000,
  },
  
  // Configurações de feature flags
  features: {
    enableDarkMode: true,
    enableNotifications: true,
    enableReports: true,
    enableInventory: true,
    enableWaitingList: true,
    enableAnamnesis: true,
  },
} as const;

// Tipos derivados das constantes
export type AppointmentStatus = keyof typeof APP_CONFIG.appointmentStatus;
export type InventoryUnit = typeof APP_CONFIG.inventory.units[number];
export type Theme = 'light' | 'dark' | 'system';

// Utilitários para trabalhar com constantes
export const getAppointmentStatusConfig = (status: AppointmentStatus) => {
  return APP_CONFIG.appointmentStatus[status];
};

export const isValidInventoryUnit = (unit: string): unit is InventoryUnit => {
  return APP_CONFIG.inventory.units.includes(unit as InventoryUnit);
};

export const getWorkingDayName = (dayIndex: number): string => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayIndex] || 'Dia inválido';
};