// Permissions constants for RBAC system
export const PERMISSIONS = {
  // Super Admin permissions
  SUPER_ADMIN_ACCESS: 'super_admin_access',
  TENANT_VIEW_ALL: 'tenant_view_all',
  TENANT_MANAGE: 'tenant_manage',
  TENANT_ACTIVATE_DEACTIVATE: 'tenant_activate_deactivate',
  
  // General permissions
  DASHBOARD_VIEW: 'dashboard_view',
  
  // User management permissions
  USER_VIEW_ALL: 'user_view_all',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_INVITE: 'user_invite',
  USER_ROLE_ASSIGN: 'user_role_assign',
  
  // Appointment permissions
  APPOINTMENT_VIEW_ALL: 'appointment_view_all',
  APPOINTMENT_VIEW_OWN: 'appointment_view_own',
  APPOINTMENT_CREATE: 'appointment_create',
  APPOINTMENT_UPDATE: 'appointment_update',
  APPOINTMENT_DELETE: 'appointment_delete',
  
  // Patient permissions
  PATIENT_VIEW_ALL: 'patient_view_all',
  PATIENT_VIEW_OWN: 'patient_view_own',
  PATIENT_CREATE: 'patient_create',
  PATIENT_UPDATE: 'patient_update',
  PATIENT_DELETE: 'patient_delete',
  
  // Professional permissions (renamed from dentist)
  PROFESSIONAL_VIEW_ALL: 'professional_view_all',
  PROFESSIONAL_CREATE: 'professional_create',
  PROFESSIONAL_UPDATE: 'professional_update',
  PROFESSIONAL_DELETE: 'professional_delete',
  
  // Legacy dentist permissions (for backwards compatibility)
  DENTIST_VIEW_ALL: 'professional_view_all', // Alias
  DENTIST_CREATE: 'professional_create', // Alias
  DENTIST_UPDATE: 'professional_update', // Alias
  DENTIST_DELETE: 'professional_delete', // Alias
  
  // Waiting list permissions
  WAITING_LIST_VIEW: 'waiting_list_view',
  WAITING_LIST_MANAGE: 'waiting_list_manage',
  WAITING_LIST_AUTO_SCHEDULE: 'waiting_list_auto_schedule',
  
  // Material/Inventory permissions
  INVENTORY_VIEW: 'inventory_view',
  INVENTORY_MANAGE: 'inventory_manage',
  MATERIAL_CREATE: 'material_create',
  MATERIAL_UPDATE: 'material_update',
  MATERIAL_DELETE: 'material_delete',
  MATERIAL_ENTRY_CREATE: 'material_entry_create',
  MATERIAL_CONSUMPTION_CREATE: 'material_consumption_create',
  
  // WhatsApp permissions
  WHATSAPP_VIEW: 'whatsapp_view',
  WHATSAPP_CONFIG: 'whatsapp_config',
  WHATSAPP_SEND: 'whatsapp_send',
  WHATSAPP_TEMPLATES: 'whatsapp_templates',
  
  // AI Agent permissions
  AI_AGENT_VIEW: 'ai_agent_view',
  AI_AGENT_CONFIG: 'ai_agent_config',
  AI_LEADS_VIEW: 'ai_leads_view',
  AI_LEADS_MANAGE: 'ai_leads_manage',
  AI_INTENTS_MANAGE: 'ai_intents_manage',
  AI_FUNNELS_MANAGE: 'ai_funnels_manage',
  
  // Reports permissions
  REPORTS_VIEW: 'reports_view',
  REPORTS_VIEW_ALL: 'reports_view_all',
  REPORTS_VIEW_OWN: 'reports_view_own',
  REPORTS_FINANCIAL: 'reports_financial',
  REPORTS_EXPORT: 'reports_export',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_CLINIC_UPDATE: 'settings_clinic_update',
  CLINIC_SETTINGS_MANAGE: 'clinic_settings_manage',
  SETTINGS_SYSTEM: 'settings_system',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// User roles - Updated for beauty clinic structure
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLINIC_OWNER: 'clinic_owner',         // New: Proprietária Clínica
  CLINIC_MANAGER: 'clinic_manager',     // New: Gerente da Clínica  
  PROFESSIONAL: 'professional',         // New: Esteticistas/médicos (renamed from dentist)
  RECEPTIONIST: 'receptionist',         // Atendimento
  
  // Legacy aliases for backwards compatibility
  CLINIC_ADMIN: 'clinic_owner',         // Alias for clinic_owner
  DENTIST: 'professional',              // Alias for professional
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.CLINIC_OWNER]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    
    // User management (complete)
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_ROLE_ASSIGN,
    
    // Full appointment access
    PERMISSIONS.APPOINTMENT_VIEW_ALL,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_DELETE,
    
    // Full patient access
    PERMISSIONS.PATIENT_VIEW_ALL,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.PATIENT_DELETE,
    
    // Professional management
    PERMISSIONS.PROFESSIONAL_VIEW_ALL,
    PERMISSIONS.PROFESSIONAL_CREATE,
    PERMISSIONS.PROFESSIONAL_UPDATE,
    PERMISSIONS.PROFESSIONAL_DELETE,
    
    // Waiting list
    PERMISSIONS.WAITING_LIST_VIEW,
    PERMISSIONS.WAITING_LIST_MANAGE,
    PERMISSIONS.WAITING_LIST_AUTO_SCHEDULE,
    
    // Inventory (complete)
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.MATERIAL_CREATE,
    PERMISSIONS.MATERIAL_UPDATE,
    PERMISSIONS.MATERIAL_DELETE,
    PERMISSIONS.MATERIAL_ENTRY_CREATE,
    PERMISSIONS.MATERIAL_CONSUMPTION_CREATE,
    
    // WhatsApp (complete)
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.WHATSAPP_CONFIG,
    PERMISSIONS.WHATSAPP_SEND,
    PERMISSIONS.WHATSAPP_TEMPLATES,
    
    // AI Agent (complete)
    PERMISSIONS.AI_AGENT_VIEW,
    PERMISSIONS.AI_AGENT_CONFIG,
    PERMISSIONS.AI_LEADS_VIEW,
    PERMISSIONS.AI_LEADS_MANAGE,
    PERMISSIONS.AI_INTENTS_MANAGE,
    PERMISSIONS.AI_FUNNELS_MANAGE,
    
    // Full reports including financial
    PERMISSIONS.REPORTS_VIEW_ALL,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.REPORTS_EXPORT,
    
    // Settings (complete)
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_CLINIC_UPDATE,
    PERMISSIONS.CLINIC_SETTINGS_MANAGE,
    PERMISSIONS.SETTINGS_SYSTEM,
  ],
  
  [USER_ROLES.CLINIC_MANAGER]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    
    // User management (limited - cannot assign roles)
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_INVITE,
    
    // Full appointment access
    PERMISSIONS.APPOINTMENT_VIEW_ALL,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_DELETE,
    
    // Full patient access
    PERMISSIONS.PATIENT_VIEW_ALL,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.PATIENT_DELETE,
    
    // Professional management (view and update only)
    PERMISSIONS.PROFESSIONAL_VIEW_ALL,
    PERMISSIONS.PROFESSIONAL_CREATE,
    PERMISSIONS.PROFESSIONAL_UPDATE,
    
    // Waiting list
    PERMISSIONS.WAITING_LIST_VIEW,
    PERMISSIONS.WAITING_LIST_MANAGE,
    PERMISSIONS.WAITING_LIST_AUTO_SCHEDULE,
    
    // Inventory (complete)
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.MATERIAL_CREATE,
    PERMISSIONS.MATERIAL_UPDATE,
    PERMISSIONS.MATERIAL_DELETE,
    PERMISSIONS.MATERIAL_ENTRY_CREATE,
    PERMISSIONS.MATERIAL_CONSUMPTION_CREATE,
    
    // WhatsApp (complete)
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.WHATSAPP_CONFIG,
    PERMISSIONS.WHATSAPP_SEND,
    PERMISSIONS.WHATSAPP_TEMPLATES,
    
    // AI Agent (complete)
    PERMISSIONS.AI_AGENT_VIEW,
    PERMISSIONS.AI_AGENT_CONFIG,
    PERMISSIONS.AI_LEADS_VIEW,
    PERMISSIONS.AI_LEADS_MANAGE,
    PERMISSIONS.AI_INTENTS_MANAGE,
    PERMISSIONS.AI_FUNNELS_MANAGE,
    
    // Reports (all except financial)
    PERMISSIONS.REPORTS_VIEW_ALL,
    PERMISSIONS.REPORTS_EXPORT,
    
    // Settings (clinic only, no system)
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_CLINIC_UPDATE,
    PERMISSIONS.CLINIC_SETTINGS_MANAGE,
  ],
  
  [USER_ROLES.PROFESSIONAL]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    
    // Own appointments and some creation rights
    PERMISSIONS.APPOINTMENT_VIEW_OWN,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    
    // Patient access (view all for treatments, create/update for care)
    PERMISSIONS.PATIENT_VIEW_ALL,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    
    // View other professionals
    PERMISSIONS.PROFESSIONAL_VIEW_ALL,
    
    // Basic waiting list access
    PERMISSIONS.WAITING_LIST_VIEW,
    
    // Inventory view only
    PERMISSIONS.INVENTORY_VIEW,
    
    // WhatsApp view
    PERMISSIONS.WHATSAPP_VIEW,
    
    // AI Agent view
    PERMISSIONS.AI_AGENT_VIEW,
    PERMISSIONS.AI_LEADS_VIEW,
    
    // Own reports only
    PERMISSIONS.REPORTS_VIEW_OWN,
    
    // Basic settings
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.CLINIC_SETTINGS_MANAGE,
  ],
  
  [USER_ROLES.RECEPTIONIST]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    
    // Appointment management for all professionals
    PERMISSIONS.APPOINTMENT_VIEW_ALL,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    
    // Patient management
    PERMISSIONS.PATIENT_VIEW_ALL,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    
    // View professionals
    PERMISSIONS.PROFESSIONAL_VIEW_ALL,
    
    // Full waiting list access
    PERMISSIONS.WAITING_LIST_VIEW,
    PERMISSIONS.WAITING_LIST_MANAGE,
    PERMISSIONS.WAITING_LIST_AUTO_SCHEDULE,
    
    // Basic inventory view
    PERMISSIONS.INVENTORY_VIEW,
    
    // WhatsApp access
    PERMISSIONS.WHATSAPP_VIEW,
    PERMISSIONS.WHATSAPP_SEND,
    
    // AI Agent view
    PERMISSIONS.AI_AGENT_VIEW,
    PERMISSIONS.AI_LEADS_VIEW,
    
    // Basic settings
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

// Helper functions
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions?.includes(permission) ?? false;
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function getUserPermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] ?? [];
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Super Administrador';
    case USER_ROLES.CLINIC_OWNER:
      return 'Proprietária Clínica';
    case USER_ROLES.CLINIC_MANAGER:
      return 'Gerente da Clínica';
    case USER_ROLES.PROFESSIONAL:
      return 'Profissional';
    case USER_ROLES.RECEPTIONIST:
      return 'Atendimento';
    default:
      // Handle legacy roles
      if (role === 'clinic_admin') return 'Proprietária Clínica';
      if (role === 'dentist') return 'Profissional';
      return role;
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Acesso total ao sistema e gestão de clínicas';
    case USER_ROLES.CLINIC_OWNER:
      return 'Gestão completa da clínica, incluindo usuários e relatórios financeiros';
    case USER_ROLES.CLINIC_MANAGER:
      return 'Gerenciamento das operações diárias da clínica e equipe';
    case USER_ROLES.PROFESSIONAL:
      return 'Acesso aos próprios agendamentos, clientes e serviços';
    case USER_ROLES.RECEPTIONIST:
      return 'Gestão de agendamentos e atendimento básico ao cliente';
    default:
      // Handle legacy roles
      if (role === 'clinic_admin') return 'Gestão completa da clínica, incluindo usuários e relatórios financeiros';
      if (role === 'dentist') return 'Acesso aos próprios agendamentos, clientes e serviços';
      return '';
  }
}

// Available roles that can be assigned (excluding super_admin)
export const ASSIGNABLE_ROLES: UserRole[] = [
  USER_ROLES.CLINIC_OWNER,
  USER_ROLES.CLINIC_MANAGER,
  USER_ROLES.PROFESSIONAL,
  USER_ROLES.RECEPTIONIST,
];
