// Tipos para autenticação e autorização

export type Role = 'super_admin' | 'owner' | 'admin' | 'professional' | 'receptionist';

export type Permission = 
  | 'manage_users'
  | 'manage_patients' 
  | 'manage_appointments'
  | 'manage_professionals'
  | 'manage_inventory'
  | 'view_reports'
  | 'manage_settings'
  | 'super_admin'
  | 'manage_billing';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  roles: string[];
  defaultRole: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  planId?: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';
  trialEndsAt?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithTenant extends AuthUser {
  tenantId: string;
  role: Role;
  tenant?: Tenant;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly?: number;
  maxUsers?: number;
  maxPatients?: number;
  maxAppointmentsPerMonth?: number;
  features: Record<string, any>;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  category?: string;
  isPremium: boolean;
}

// Tipos para GraphQL responses
export interface GraphQLUser {
  id: string;
  email: string;
  display_name?: string;
  role: Role;
  is_active: boolean;
  tenant_id: string;
  tenant?: {
    id: string;
    name: string;
    subdomain?: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    is_active: boolean;
    plan_id?: string;
    subscription_status: string;
  };
}

export interface GraphQLTenant {
  id: string;
  name: string;
  subdomain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  plan_id?: string;
  subscription_status: string;
  trial_ends_at?: string;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  created_at: string;
  updated_at: string;
}