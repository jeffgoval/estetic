import { useAuth } from './useAuth';
import type { Permission, Role } from '../types/auth';

// Mapeamento de permissões por role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'super_admin',
    'manage_users',
    'manage_patients',
    'manage_appointments',
    'manage_professionals',
    'manage_inventory',
    'view_reports',
    'manage_settings',
    'manage_billing',
  ],
  owner: [
    'manage_users',
    'manage_patients',
    'manage_appointments',
    'manage_professionals',
    'manage_inventory',
    'view_reports',
    'manage_settings',
    'manage_billing',
  ],
  admin: [
    'manage_patients',
    'manage_appointments',
    'manage_professionals',
    'manage_inventory',
    'view_reports',
    'manage_settings',
  ],
  professional: [
    'manage_patients',
    'manage_appointments',
    'view_reports',
  ],
  receptionist: [
    'manage_patients',
    'manage_appointments',
  ],
};

interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canManageUsers: boolean;
  canManagePatients: boolean;
  canManageAppointments: boolean;
  canManageProfessionals: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  isReceptionist: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();

  const getUserPermissions = (): Permission[] => {
    if (!user?.role) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  };

  const hasPermission = (permission: Permission): boolean => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Permissões específicas
    canManageUsers: hasPermission('manage_users'),
    canManagePatients: hasPermission('manage_patients'),
    canManageAppointments: hasPermission('manage_appointments'),
    canManageProfessionals: hasPermission('manage_professionals'),
    canManageInventory: hasPermission('manage_inventory'),
    canViewReports: hasPermission('view_reports'),
    canManageSettings: hasPermission('manage_settings'),
    canManageBilling: hasPermission('manage_billing'),
    
    // Verificações de role
    isSuperAdmin: user?.role === 'super_admin',
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
    isProfessional: user?.role === 'professional',
    isReceptionist: user?.role === 'receptionist',
  };
};