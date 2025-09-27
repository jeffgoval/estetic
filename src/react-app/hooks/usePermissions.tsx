import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Permission, 
  UserRole, 
  hasPermission, 
  hasAnyPermission, 
  getUserPermissions,
  USER_ROLES 
} from '@/shared/permissions';

interface PermissionsContextType {
  userRole: UserRole | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isSuperAdmin: boolean;
  isClinicOwner: boolean;
  isClinicManager: boolean;
  isProfessional: boolean;
  isReceptionist: boolean;
  canAccess: (requiredPermissions: Permission[]) => boolean;
  // Legacy aliases for backwards compatibility
  isClinicAdmin: boolean;
  isDentist: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { user } = useAuth();
  
  // Get user role from the app user data with fallback refresh if needed
  const userRole = ((user as any)?.appUser?.role as UserRole) || null;
  
  // Get permissions for the current user role
  const permissions = userRole ? getUserPermissions(userRole) : [];
  
  const contextValue: PermissionsContextType = {
    userRole,
    permissions,
    hasPermission: (permission: Permission) => {
      return userRole ? hasPermission(userRole, permission) : false;
    },
    hasAnyPermission: (requiredPermissions: Permission[]) => {
      return userRole ? hasAnyPermission(userRole, requiredPermissions) : false;
    },
    isSuperAdmin: userRole === USER_ROLES.SUPER_ADMIN,
    isClinicOwner: userRole === USER_ROLES.CLINIC_OWNER || (userRole as string) === 'clinic_admin', // Support legacy
    isClinicManager: userRole === USER_ROLES.CLINIC_MANAGER,
    isProfessional: userRole === USER_ROLES.PROFESSIONAL || (userRole as string) === 'dentist', // Support legacy
    isReceptionist: userRole === USER_ROLES.RECEPTIONIST,
    canAccess: (requiredPermissions: Permission[]) => {
      if (!userRole || requiredPermissions.length === 0) return false;
      return hasAnyPermission(userRole, requiredPermissions);
    },
    // Legacy aliases for backwards compatibility
    isClinicAdmin: userRole === USER_ROLES.CLINIC_OWNER || (userRole as string) === 'clinic_admin',
    isDentist: userRole === USER_ROLES.PROFESSIONAL || (userRole as string) === 'dentist',
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Convenience hook for checking specific permissions
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// Convenience hook for checking multiple permissions (any)
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

// Convenience hook for role checks
export function useIsRole(role: UserRole): boolean {
  const { userRole } = usePermissions();
  return userRole === role;
}
