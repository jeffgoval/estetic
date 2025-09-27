import z from "zod";

// Tenant schemas
export const TenantSchema = z.object({
  id: z.number(),
  name: z.string(),
  subdomain: z.string().optional(),
  logo_url: z.string().optional(),
  primary_color: z.string().default('#3B82F6'),
  secondary_color: z.string().default('#10B981'),
  is_active: z.boolean().default(true),
  plan_type: z.string().default('basic'),
  created_at: z.string(),
  updated_at: z.string(),
});

// User schemas
export const UserSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  mocha_user_id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  role: z.string().default('user'),
  is_active: z.boolean().default(true),
  permissions: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Professional schemas (renamed from Dentist for aesthetics clinic)
export const ProfessionalSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  registrationNumber: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isActive: z.boolean().default(true),
  workingHours: z.record(z.object({
    start: z.string(),
    end: z.string(),
    breaks: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
  })).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateProfessionalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  registrationNumber: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  workingHours: z.record(z.object({
    start: z.string(),
    end: z.string(),
    breaks: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
  })).optional(),
});

// Legacy Dentist schemas (for backwards compatibility)
export const DentistSchema = ProfessionalSchema;
export const CreateDentistSchema = CreateProfessionalSchema;

// Patient schemas
export const PatientSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  medical_history: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreatePatientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  medical_history: z.string().optional(),
});

// Appointment schemas
export const AppointmentSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  patient_id: z.number(),
  professional_id: z.number(), // Renamed from dentist_id for aesthetics clinic
  title: z.string(),
  description: z.string().optional(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  status: z.string().default('scheduled'),
  service_type: z.string().optional(), // Renamed from appointment_type to service_type
  notes: z.string().optional(),
  created_by: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Legacy field for backwards compatibility
  dentist_id: z.number().optional(),
  // Joined fields from database queries
  patient_name: z.string().optional(),
  dentist_name: z.string().optional(),
  professional_name: z.string().optional(),
  patient_phone: z.string().optional(),
});

export const CreateAppointmentSchema = z.object({
  patient_id: z.number(),
  professional_id: z.number().optional(), // For new API calls
  dentist_id: z.number().optional(), // Legacy compatibility - either this or professional_id required
  title: z.string().optional(), // Auto-generated from service type
  description: z.string().optional(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  service_type: z.string().optional(), // New field name
  appointment_type: z.string().optional(), // Legacy compatibility
  notes: z.string().optional(),
});

// Procedure schemas
export const ProcedureSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  duration_minutes: z.number().default(60),
  price: z.number().optional(),
  fixed_price: z.number().default(0),
  variable_price_notes: z.string().optional(),
  materials_cost: z.number().default(0),
  profit_margin: z.number().default(0),
  category: z.string().default('geral'),
  complexity_level: z.number().default(1),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateProcedureSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  duration_minutes: z.number().min(1).default(60),
  price: z.number().min(0).optional(),
  fixed_price: z.number().min(0).default(0),
  variable_price_notes: z.string().optional(),
  materials_cost: z.number().min(0).default(0),
  profit_margin: z.number().min(0).default(0),
  category: z.string().default('geral'),
  procedure_category_id: z.number().optional(),
  complexity_level: z.number().min(1).max(5).default(1),
});

// Procedure Material schemas
export const ProcedureMaterialSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  procedure_id: z.number(),
  material_id: z.number(),
  quantity_required: z.number(),
  is_mandatory: z.boolean().default(true),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateProcedureMaterialSchema = z.object({
  material_id: z.number(),
  quantity_required: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  is_mandatory: z.boolean().default(true),
  notes: z.string().optional(),
});

// Waiting List schemas
export const WaitingListSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  patient_id: z.number(),
  professional_id: z.number().optional(), // Renamed from dentist_id for aesthetics clinic
  procedure_id: z.number().optional(),
  preferred_date: z.string().optional(),
  preferred_time_start: z.string().optional(),
  preferred_time_end: z.string().optional(),
  priority: z.number().default(1),
  status: z.string().default('waiting'),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Legacy field for backwards compatibility
  dentist_id: z.number().optional(),
});

export const CreateWaitingListSchema = z.object({
  patient_id: z.number(),
  professional_id: z.number().optional(), // Renamed from dentist_id for aesthetics clinic
  procedure_id: z.number().optional(),
  preferred_date: z.string().optional(),
  preferred_time_start: z.string().optional(),
  preferred_time_end: z.string().optional(),
  priority: z.number().min(1).max(5).default(1),
  notes: z.string().optional(),
  // Legacy field for backwards compatibility
  dentist_id: z.number().optional(),
});

// Material Category schemas
export const MaterialCategorySchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateMaterialCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

// Material schemas
export const MaterialSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  category_id: z.number().optional(),
  name: z.string(),
  brand: z.string().optional(),
  description: z.string().optional(),
  unit_type: z.string().default('unidade'),
  min_stock_level: z.number().default(0),
  max_stock_level: z.number().default(100),
  current_stock: z.number().default(0),
  unit_cost: z.number().default(0),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateMaterialSchema = z.object({
  category_id: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().optional(),
  description: z.string().optional(),
  unit_type: z.string().default('unidade'),
  min_stock_level: z.number().min(0).default(0),
  max_stock_level: z.number().min(1).default(100),
  unit_cost: z.number().min(0).default(0),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
});

// Material Entry schemas
export const MaterialEntrySchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  material_id: z.number(),
  entry_type: z.string().default('in'),
  quantity: z.number(),
  unit_cost: z.number().default(0),
  total_cost: z.number().default(0),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
  supplier_name: z.string().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateMaterialEntrySchema = z.object({
  material_id: z.number(),
  entry_type: z.enum(['in', 'out']).default('in'),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unit_cost: z.number().min(0).default(0),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
  supplier_name: z.string().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
});

// Material Consumption schemas
export const MaterialConsumptionSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  material_id: z.number(),
  appointment_id: z.number().optional(),
  procedure_id: z.number().optional(),
  quantity_used: z.number(),
  consumed_at: z.string(),
  notes: z.string().optional(),
  created_by: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateMaterialConsumptionSchema = z.object({
  material_id: z.number(),
  appointment_id: z.number().optional(),
  procedure_id: z.number().optional(),
  quantity_used: z.number().min(1, "Quantidade deve ser maior que 0"),
  notes: z.string().optional(),
});

// Material Alert schemas
export const MaterialAlertSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  material_id: z.number(),
  alert_type: z.string(),
  alert_message: z.string(),
  is_read: z.boolean().default(false),
  expires_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Procedure Category schemas
export const ProcedureCategorySchema = z.object({
  id: z.number(),
  tenant_id: z.number().optional(),
  name: z.string(),
  parent_id: z.number().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateProcedureCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  parent_id: z.number().optional(),
  description: z.string().optional(),
  tenant_id: z.number().optional(),
});

// Type exports
export type Tenant = z.infer<typeof TenantSchema>;
export type User = z.infer<typeof UserSchema>;
export type Professional = z.infer<typeof ProfessionalSchema>;
export type CreateProfessional = z.infer<typeof CreateProfessionalSchema>;
// Legacy dentist types (for backwards compatibility)
export type Dentist = z.infer<typeof DentistSchema>;
export type CreateDentist = z.infer<typeof CreateDentistSchema>;
export type Patient = z.infer<typeof PatientSchema>;
export type CreatePatient = z.infer<typeof CreatePatientSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type Procedure = z.infer<typeof ProcedureSchema>;
export type CreateProcedure = z.infer<typeof CreateProcedureSchema>;
export type ProcedureMaterial = z.infer<typeof ProcedureMaterialSchema>;
export type CreateProcedureMaterial = z.infer<typeof CreateProcedureMaterialSchema>;
export type WaitingList = z.infer<typeof WaitingListSchema>;
export type CreateWaitingList = z.infer<typeof CreateWaitingListSchema>;
export type MaterialCategory = z.infer<typeof MaterialCategorySchema>;
export type CreateMaterialCategory = z.infer<typeof CreateMaterialCategorySchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type CreateMaterial = z.infer<typeof CreateMaterialSchema>;
export type MaterialEntry = z.infer<typeof MaterialEntrySchema>;
export type CreateMaterialEntry = z.infer<typeof CreateMaterialEntrySchema>;
export type MaterialConsumption = z.infer<typeof MaterialConsumptionSchema>;
export type CreateMaterialConsumption = z.infer<typeof CreateMaterialConsumptionSchema>;
export type MaterialAlert = z.infer<typeof MaterialAlertSchema>;

// WhatsApp Config schemas
export const WhatsAppConfigSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  api_token: z.string().optional(),
  phone_number: z.string().optional(),
  webhook_url: z.string().optional(),
  is_connected: z.boolean().default(false),
  auto_responses_enabled: z.boolean().default(true),
  appointment_booking_enabled: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateWhatsAppConfigSchema = z.object({
  api_token: z.string().optional(),
  phone_number: z.string().optional(),
  webhook_url: z.string().url().optional().or(z.literal("")),
  auto_responses_enabled: z.boolean().default(true),
  appointment_booking_enabled: z.boolean().default(true),
});

// WhatsApp Template schemas
export const WhatsAppTemplateSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  message: z.string(),
  template_type: z.string().default('custom'),
  variables: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateWhatsAppTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  template_type: z.enum(['reminder', 'confirmation', 'welcome', 'custom']).default('custom'),
});

// WhatsApp Contact schemas
export const WhatsAppContactSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  phone: z.string(),
  name: z.string().optional(),
  last_message_at: z.string().optional(),
  status: z.string().default('active'),
  is_patient: z.boolean().default(false),
  patient_id: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateWhatsAppContactSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  name: z.string().optional(),
  is_patient: z.boolean().default(false),
  patient_id: z.number().optional(),
});

// WhatsApp Message schemas
export const WhatsAppMessageSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  contact_phone: z.string(),
  message: z.string(),
  direction: z.string().default('outgoing'),
  status: z.string().default('sent'),
  message_type: z.string().default('text'),
  template_id: z.number().optional(),
  appointment_id: z.number().optional(),
  sent_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateWhatsAppMessageSchema = z.object({
  contact_phone: z.string().min(1, "Telefone é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  direction: z.enum(['incoming', 'outgoing']).default('outgoing'),
  message_type: z.enum(['text', 'template', 'automated']).default('text'),
  template_id: z.number().optional(),
  appointment_id: z.number().optional(),
});

// WhatsApp Automation schemas
export const WhatsAppAutomationSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  trigger_type: z.string(),
  trigger_conditions: z.string().optional(),
  template_id: z.number().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateWhatsAppAutomationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  trigger_type: z.enum(['appointment_reminder', 'appointment_confirmation', 'message_received', 'patient_registered']),
  trigger_conditions: z.string().optional(),
  template_id: z.number().optional(),
});

// AI Lead schemas
export const AILeadSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string().optional(),
  phone: z.string(),
  email: z.string().optional(),
  source: z.string().default('whatsapp'),
  status: z.string().default('new'),
  interest_level: z.number().default(1),
  conversation_stage: z.string().default('initial_contact'),
  last_interaction_at: z.string(),
  notes: z.string().optional(),
  metadata: z.string().optional(),
  is_patient: z.boolean().default(false),
  patient_id: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAILeadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().default('whatsapp'),
  notes: z.string().optional(),
});

// AI Conversation schemas
export const AIConversationSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  lead_id: z.number(),
  conversation_id: z.string(),
  message: z.string(),
  sender: z.string(),
  message_type: z.string().default('text'),
  ai_response: z.boolean().default(false),
  intent_detected: z.string().optional(),
  confidence_score: z.number().optional(),
  follow_up_scheduled: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAIConversationSchema = z.object({
  lead_id: z.number(),
  conversation_id: z.string(),
  message: z.string().min(1, "Mensagem é obrigatória"),
  sender: z.enum(['lead', 'ai', 'agent']),
  message_type: z.string().default('text'),
  ai_response: z.boolean().default(false),
  intent_detected: z.string().optional(),
  confidence_score: z.number().optional(),
});

// AI Intent schemas
export const AIIntentSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  response_template: z.string().optional(),
  follow_up_action: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAIIntentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  keywords: z.string().optional(),
  response_template: z.string().optional(),
  follow_up_action: z.string().optional(),
});

// AI Sales Funnel schemas
export const AISalesFunnelSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  stages: z.string(),
  automation_rules: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAISalesFunnelSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  stages: z.string().min(1, "Estágios são obrigatórios"),
  automation_rules: z.string().optional(),
});

// AI Lead Activity schemas
export const AILeadActivitySchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  lead_id: z.number(),
  activity_type: z.string(),
  activity_data: z.string().optional(),
  performed_by: z.string().default('ai'),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAILeadActivitySchema = z.object({
  lead_id: z.number(),
  activity_type: z.string().min(1, "Tipo de atividade é obrigatório"),
  activity_data: z.string().optional(),
  performed_by: z.string().default('ai'),
});

// AI Analytics schemas
export const AIAnalyticsSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  metric_name: z.string(),
  metric_value: z.number(),
  metric_date: z.string(),
  metadata: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAIAnalyticsSchema = z.object({
  metric_name: z.string().min(1, "Nome da métrica é obrigatório"),
  metric_value: z.number(),
  metric_date: z.string(),
  metadata: z.string().optional(),
});

// Type exports
export type WhatsAppConfig = z.infer<typeof WhatsAppConfigSchema>;
export type CreateWhatsAppConfig = z.infer<typeof CreateWhatsAppConfigSchema>;
export type WhatsAppTemplate = z.infer<typeof WhatsAppTemplateSchema>;
export type CreateWhatsAppTemplate = z.infer<typeof CreateWhatsAppTemplateSchema>;
export type WhatsAppContact = z.infer<typeof WhatsAppContactSchema>;
export type CreateWhatsAppContact = z.infer<typeof CreateWhatsAppContactSchema>;
export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;
export type CreateWhatsAppMessage = z.infer<typeof CreateWhatsAppMessageSchema>;
export type WhatsAppAutomation = z.infer<typeof WhatsAppAutomationSchema>;
export type CreateWhatsAppAutomation = z.infer<typeof CreateWhatsAppAutomationSchema>;

// AI Type exports
export type AILead = z.infer<typeof AILeadSchema>;
export type CreateAILead = z.infer<typeof CreateAILeadSchema>;
export type AIConversation = z.infer<typeof AIConversationSchema>;
export type CreateAIConversation = z.infer<typeof CreateAIConversationSchema>;
export type AIIntent = z.infer<typeof AIIntentSchema>;
export type CreateAIIntent = z.infer<typeof CreateAIIntentSchema>;
export type AISalesFunnel = z.infer<typeof AISalesFunnelSchema>;
export type CreateAISalesFunnel = z.infer<typeof CreateAISalesFunnelSchema>;
export type AILeadActivity = z.infer<typeof AILeadActivitySchema>;
export type CreateAILeadActivity = z.infer<typeof CreateAILeadActivitySchema>;
export type AIAnalytics = z.infer<typeof AIAnalyticsSchema>;
export type CreateAIAnalytics = z.infer<typeof CreateAIAnalyticsSchema>;
export type ProcedureCategory = z.infer<typeof ProcedureCategorySchema>;
export type CreateProcedureCategory = z.infer<typeof CreateProcedureCategorySchema>;

// ============================================================================
// ANAMNESIS MODULE SCHEMAS - Digital Forms and Protocols System
// ============================================================================

// Anamnesis Template schemas
export const AnamnesisTemplateSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  sections: z.string(), // JSON with form structure
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
  created_by: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Joined fields from database queries
  created_by_name: z.string().optional(),
});

export const CreateAnamnesisTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'textarea', 'select', 'checkbox', 'radio', 'date', 'number', 'email', 'phone']),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(), // For select, radio, checkbox
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        message: z.string().optional(),
      }).optional(),
    })),
  })),
  is_default: z.boolean().default(false),
});

// Anamnesis Form schemas
export const AnamnesisFormSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  patient_id: z.number(),
  appointment_id: z.number().optional(),
  template_id: z.number(),
  form_token: z.string(),
  form_data: z.string(), // JSON with form responses
  status: z.enum(['pending', 'completed', 'expired']).default('pending'),
  alerts_detected: z.string().optional(), // JSON with detected alerts
  expires_at: z.string().optional(),
  completed_at: z.string().optional(),
  sent_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Joined fields from database queries
  patient_name: z.string().optional(),
  template_name: z.string().optional(),
  appointment_date: z.string().optional(),
});

export const CreateAnamnesisFormSchema = z.object({
  patient_id: z.number(),
  appointment_id: z.number().optional(),
  template_id: z.number().optional(), // If not provided, uses default template
  expires_in_hours: z.number().min(1).max(168).default(48), // 1 hour to 7 days
});

export const SubmitAnamnesisFormSchema = z.object({
  form_data: z.record(z.any()), // Dynamic form data based on template
});

// Treatment Protocol schemas
export const TreatmentProtocolSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  patient_id: z.number(),
  appointment_id: z.number().optional(),
  anamnesis_form_id: z.number().optional(),
  professional_id: z.number(),
  protocol_title: z.string(),
  objectives: z.string().optional(),
  contraindications: z.string().optional(),
  recommended_procedures: z.string(), // JSON array of procedures
  care_instructions: z.string().optional(),
  follow_up_plan: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'ready', 'approved', 'completed']).default('draft'),
  created_by: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Joined fields from database queries
  patient_name: z.string().optional(),
  professional_name: z.string().optional(),
  appointment_date: z.string().optional(),
});

export const CreateTreatmentProtocolSchema = z.object({
  patient_id: z.number(),
  appointment_id: z.number().optional(),
  anamnesis_form_id: z.number().optional(),
  professional_id: z.number(),
  protocol_title: z.string().min(1, "Título do protocolo é obrigatório"),
  objectives: z.string().optional(),
  contraindications: z.string().optional(),
  recommended_procedures: z.array(z.object({
    procedure_id: z.number().optional(),
    procedure_name: z.string(),
    description: z.string().optional(),
    estimated_duration: z.number().optional(),
    estimated_cost: z.number().optional(),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    materials_needed: z.array(z.string()).optional(),
  })).default([]),
  care_instructions: z.string().optional(),
  follow_up_plan: z.string().optional(),
  notes: z.string().optional(),
});

// Consent Form schemas
export const ConsentFormSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  patient_id: z.number(),
  appointment_id: z.number().optional(),
  anamnesis_form_id: z.number().optional(),
  protocol_id: z.number().optional(),
  consent_text: z.string(),
  patient_signature: z.string().optional(), // Digital signature data
  signed_at: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  is_valid: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateConsentFormSchema = z.object({
  tenant_id: z.number(),
  patient_id: z.number(),
  appointment_id: z.number().optional(),
  anamnesis_form_id: z.number().optional(),
  protocol_id: z.number().optional(),
  consent_text: z.string().min(1, "Texto do termo de consentimento é obrigatório"),
  patient_signature: z.string().min(1, "Assinatura do paciente é obrigatória"),
});

// Anamnesis Keywords schemas
export const AnamnesisKeywordSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  keyword: z.string(),
  alert_level: z.enum(['critical', 'warning', 'info']).default('warning'),
  alert_message: z.string().optional(),
  contraindications: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateAnamnesisKeywordSchema = z.object({
  keyword: z.string().min(1, "Palavra-chave é obrigatória"),
  alert_level: z.enum(['critical', 'warning', 'info']).default('warning'),
  alert_message: z.string().optional(),
  contraindications: z.string().optional(),
});

// Send Anamnesis Form schemas
export const SendAnamnesisFormSchema = z.object({
  method: z.enum(['email', 'whatsapp']),
});

// Anamnesis Analytics schemas
export const AnamnesisAnalyticsSchema = z.object({
  total_forms: z.number(),
  completed_forms: z.number(),
  completion_rate: z.number(),
  avg_completion_time_minutes: z.number(),
  forms_with_alerts: z.number(),
  recent_forms: z.array(z.object({
    id: z.number(),
    status: z.string(),
    created_at: z.string(),
    patient_name: z.string(),
    alerts_count: z.number(),
  })),
});

// Type exports for Anamnesis Module
export type AnamnesisTemplate = z.infer<typeof AnamnesisTemplateSchema>;
export type CreateAnamnesisTemplate = z.infer<typeof CreateAnamnesisTemplateSchema>;
export type AnamnesisForm = z.infer<typeof AnamnesisFormSchema>;
export type CreateAnamnesisForm = z.infer<typeof CreateAnamnesisFormSchema>;
export type SubmitAnamnesisForm = z.infer<typeof SubmitAnamnesisFormSchema>;
export type TreatmentProtocol = z.infer<typeof TreatmentProtocolSchema>;
export type CreateTreatmentProtocol = z.infer<typeof CreateTreatmentProtocolSchema>;
export type ConsentForm = z.infer<typeof ConsentFormSchema>;
export type CreateConsentForm = z.infer<typeof CreateConsentFormSchema>;
export type AnamnesisKeyword = z.infer<typeof AnamnesisKeywordSchema>;
export type CreateAnamnesisKeyword = z.infer<typeof CreateAnamnesisKeywordSchema>;
export type SendAnamnesisForm = z.infer<typeof SendAnamnesisFormSchema>;
export type AnamnesisAnalytics = z.infer<typeof AnamnesisAnalyticsSchema>;

// ============================================================================
// FEATURE FLAGS SYSTEM - SaaS Multi-Tenant Feature Management
// ============================================================================

// Subscription Plan schemas
export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price_monthly: z.number(),
  price_yearly: z.number().optional(),
  max_users: z.number().optional(),
  max_patients: z.number().optional(),
  max_appointments_per_month: z.number().optional(),
  features: z.record(z.any()).default({}), // Feature flags as JSON
  is_active: z.boolean().default(true),
  is_popular: z.boolean().default(false),
  sort_order: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

// Feature Flag schemas
export const FeatureFlagSchema = z.object({
  id: z.string(),
  key: z.string(), // e.g., 'whatsapp_integration', 'ai_agent', 'advanced_reports'
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(), // e.g., 'communication', 'analytics', 'automation'
  is_premium: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

// Plan Features (many-to-many relationship)
export const PlanFeatureSchema = z.object({
  id: z.string(),
  plan_id: z.string(),
  feature_flag_id: z.string(),
  is_enabled: z.boolean().default(true),
  limits: z.record(z.any()).optional(), // Feature-specific limits
  created_at: z.string(),
});

// Tenant Feature Overrides
export const TenantFeatureOverrideSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  feature_flag_id: z.string(),
  is_enabled: z.boolean(),
  limits: z.record(z.any()).optional(),
  expires_at: z.string().optional(),
  reason: z.string().optional(), // e.g., 'promotional_access', 'custom_plan', 'beta_testing'
  created_by: z.string().optional(), // super admin who granted access
  created_at: z.string(),
});

// Usage Tracking
export const TenantUsageSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  feature_key: z.string(),
  usage_count: z.number().default(0),
  period_start: z.string(),
  period_end: z.string(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Feature Access Result
export const FeatureAccessSchema = z.object({
  enabled: z.boolean(),
  limits: z.record(z.any()).optional(),
  usage: z.object({
    current: z.number(),
    limit: z.number().optional(),
    remaining: z.number().optional(),
  }).optional(),
  reason: z.string().optional(), // Why access was granted/denied
});

// Type exports for Feature Flags
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;
export type TenantFeatureOverride = z.infer<typeof TenantFeatureOverrideSchema>;
export type TenantUsage = z.infer<typeof TenantUsageSchema>;
export type FeatureAccess = z.infer<typeof FeatureAccessSchema>;
