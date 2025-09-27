/**
 * Configurações de permissões e RLS (Row Level Security)
 * Define as regras de acesso baseadas em roles e tenant
 */

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  condition?: string;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// Definição das permissões por role
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: [
      // Super admin tem acesso total a tudo
      { resource: '*', action: 'create' },
      { resource: '*', action: 'read' },
      { resource: '*', action: 'update' },
      { resource: '*', action: 'delete' },
    ],
  },
  {
    role: 'owner',
    permissions: [
      // Owner tem acesso total ao seu tenant
      { resource: 'patients', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'appointments', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'professionals', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'professionals', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'professionals', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'professionals', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'materials', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'materials', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'materials', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'materials', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'waiting_list', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'anamnesis_templates', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'anamnesis_forms', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
    ],
  },
  {
    role: 'admin',
    permissions: [
      // Admin tem acesso similar ao owner, mas não pode deletar dados críticos
      { resource: 'patients', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'appointments', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'professionals', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'professionals', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'professionals', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'materials', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'materials', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'materials', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'waiting_list', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'anamnesis_templates', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'anamnesis_forms', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'update', condition: 'tenant_id = current_tenant_id()' },
    ],
  },
  {
    role: 'professional',
    permissions: [
      // Profissional pode ver pacientes e agendamentos, mas com acesso limitado
      { resource: 'patients', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'appointments', action: 'read', condition: 'tenant_id = current_tenant_id() AND professional_id = current_user_professional_id()' },
      { resource: 'appointments', action: 'update', condition: 'tenant_id = current_tenant_id() AND professional_id = current_user_professional_id()' },
      
      { resource: 'professionals', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'professionals', action: 'update', condition: 'tenant_id = current_tenant_id() AND id = current_user_professional_id()' },
      
      { resource: 'materials', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'waiting_list', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'anamnesis_templates', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_templates', action: 'update', condition: 'tenant_id = current_tenant_id() AND created_by = current_user_id()' },
      
      { resource: 'anamnesis_forms', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'update', condition: 'tenant_id = current_tenant_id()' },
    ],
  },
  {
    role: 'receptionist',
    permissions: [
      // Recepcionista foca em agendamentos e pacientes
      { resource: 'patients', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'patients', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'appointments', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'appointments', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'professionals', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'waiting_list', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'read', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'update', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'waiting_list', action: 'delete', condition: 'tenant_id = current_tenant_id()' },
      
      { resource: 'anamnesis_forms', action: 'create', condition: 'tenant_id = current_tenant_id()' },
      { resource: 'anamnesis_forms', action: 'read', condition: 'tenant_id = current_tenant_id()' },
    ],
  },
];

// Função para verificar se um usuário tem permissão
export const hasPermission = (
  userRole: string,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole);
  
  if (!rolePermissions) {
    return false;
  }

  // Verificar permissão específica
  const hasSpecificPermission = rolePermissions.permissions.some(
    p => (p.resource === resource || p.resource === '*') && p.action === action
  );

  return hasSpecificPermission;
};

// Função para obter todas as permissões de um role
export const getRolePermissions = (role: string): Permission[] => {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePermissions?.permissions || [];
};

// Função para verificar se é super admin
export const isSuperAdmin = (userRole: string): boolean => {
  return userRole === 'super_admin';
};

// Função para verificar se pode acessar super admin features
export const canAccessSuperAdmin = (userRole: string): boolean => {
  return isSuperAdmin(userRole);
};

// Função para verificar se pode gerenciar tenant
export const canManageTenant = (userRole: string): boolean => {
  return ['super_admin', 'owner'].includes(userRole);
};

// Função para verificar se pode gerenciar usuários
export const canManageUsers = (userRole: string): boolean => {
  return ['super_admin', 'owner', 'admin'].includes(userRole);
};

// Função para verificar se pode ver relatórios financeiros
export const canViewFinancialReports = (userRole: string): boolean => {
  return ['super_admin', 'owner'].includes(userRole);
};