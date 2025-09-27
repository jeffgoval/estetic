import z from "zod";

// Schemas para Super Admin
export const SuperAdminSubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price_monthly: z.number(),
  price_yearly: z.number().optional(),
  max_users: z.number().optional(),
  max_patients: z.number().optional(),
  max_appointments_per_month: z.number().optional(),
  features: z.record(z.any()).default({}), // Feature flags como JSON
  is_active: z.boolean().default(true),
  is_popular: z.boolean().default(false),
  sort_order: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSuperAdminSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price_monthly: z.number().min(0, "Preço mensal deve ser positivo"),
  price_yearly: z.number().min(0, "Preço anual deve ser positivo").optional(),
  max_users: z.number().min(1, "Máximo de usuários deve ser pelo menos 1").optional(),
  max_patients: z.number().min(1, "Máximo de pacientes deve ser pelo menos 1").optional(),
  max_appointments_per_month: z.number().min(1, "Máximo de agendamentos deve ser pelo menos 1").optional(),
  features: z.record(z.any()).default({}),
  is_popular: z.boolean().default(false),
  sort_order: z.number().default(0),
});

export const SuperAdminFeatureFlagSchema = z.object({
  id: z.string(),
  key: z.string(), // e.g., 'whatsapp_integration', 'ai_agent', 'advanced_reports'
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(), // e.g., 'communication', 'analytics', 'automation'
  is_premium: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSuperAdminFeatureFlagSchema = z.object({
  key: z.string().min(1, "Chave é obrigatória").regex(/^[a-z_]+$/, "Chave deve conter apenas letras minúsculas e underscore"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional(),
  is_premium: z.boolean().default(false),
});

export const SuperAdminTenantOverviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string().optional(),
  logo_url: z.string().optional(),
  primary_color: z.string().default('#3B82F6'),
  secondary_color: z.string().default('#10B981'),
  is_active: z.boolean().default(true),
  plan_id: z.string().optional(),
  subscription_status: z.enum(['trial', 'active', 'past_due', 'cancelled', 'suspended']).default('trial'),
  trial_ends_at: z.string().optional(),
  subscription_starts_at: z.string().optional(),
  subscription_ends_at: z.string().optional(),
  billing_email: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Estatísticas calculadas
  user_count: z.number().default(0),
  patient_count: z.number().default(0),
  appointment_count: z.number().default(0),
  last_activity: z.string().optional(),
  // Informações do plano
  plan_name: z.string().optional(),
});

export const SuperAdminPlatformStatsSchema = z.object({
  total_tenants: z.number(),
  active_tenants: z.number(),
  trial_tenants: z.number(),
  suspended_tenants: z.number(),
  total_users: z.number(),
  total_patients: z.number(),
  total_appointments: z.number(),
  monthly_growth: z.number(),
  revenue_current_month: z.number(),
  revenue_last_month: z.number(),
  churn_rate: z.number(),
  avg_appointments_per_tenant: z.number(),
});

// Tipos exportados
export type SuperAdminSubscriptionPlan = z.infer<typeof SuperAdminSubscriptionPlanSchema>;
export type CreateSuperAdminSubscriptionPlan = z.infer<typeof CreateSuperAdminSubscriptionPlanSchema>;
export type SuperAdminFeatureFlag = z.infer<typeof SuperAdminFeatureFlagSchema>;
export type CreateSuperAdminFeatureFlag = z.infer<typeof CreateSuperAdminFeatureFlagSchema>;
export type SuperAdminTenantOverview = z.infer<typeof SuperAdminTenantOverviewSchema>;
export type SuperAdminPlatformStats = z.infer<typeof SuperAdminPlatformStatsSchema>;