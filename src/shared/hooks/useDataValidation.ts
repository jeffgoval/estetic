import { useCallback } from 'react';
import { z } from 'zod';

// Schemas de validação para os principais tipos
export const PatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  medical_history: z.string().optional(),
});

export const ProfessionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  registration_number: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  working_hours: z.any().optional(),
});

export const AppointmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  professional_id: z.string().uuid('ID do profissional inválido'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  start_datetime: z.string().datetime('Data/hora de início inválida'),
  end_datetime: z.string().datetime('Data/hora de fim inválida'),
  service_type: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => new Date(data.end_datetime) > new Date(data.start_datetime),
  {
    message: 'Data/hora de fim deve ser posterior ao início',
    path: ['end_datetime'],
  }
);

export const MaterialSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  brand: z.string().optional(),
  description: z.string().optional(),
  unit_type: z.string().default('unidade'),
  min_stock_level: z.number().min(0, 'Estoque mínimo deve ser >= 0').default(0),
  max_stock_level: z.number().min(0, 'Estoque máximo deve ser >= 0').default(100),
  current_stock: z.number().min(0, 'Estoque atual deve ser >= 0').default(0),
  unit_cost: z.number().min(0, 'Custo unitário deve ser >= 0').default(0),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  category_id: z.string().uuid().optional(),
}).refine(
  (data) => data.max_stock_level >= data.min_stock_level,
  {
    message: 'Estoque máximo deve ser >= estoque mínimo',
    path: ['max_stock_level'],
  }
);

export const WaitingListSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  professional_id: z.string().uuid().optional(),
  preferred_date: z.string().optional(),
  preferred_time_start: z.string().optional(),
  preferred_time_end: z.string().optional(),
  priority: z.number().min(1).max(5).default(1),
  notes: z.string().optional(),
});

export const AnamnesisTemplateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sections: z.any(), // JSON schema seria mais complexo
  is_default: z.boolean().default(false),
});

export const AnamnesisFormSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  template_id: z.string().uuid('ID do template inválido'),
  appointment_id: z.string().uuid().optional(),
  form_data: z.any().optional(),
  expires_at: z.string().datetime().optional(),
});

// Tipos inferidos dos schemas
export type PatientInput = z.infer<typeof PatientSchema>;
export type ProfessionalInput = z.infer<typeof ProfessionalSchema>;
export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type MaterialInput = z.infer<typeof MaterialSchema>;
export type WaitingListInput = z.infer<typeof WaitingListSchema>;
export type AnamnesisTemplateInput = z.infer<typeof AnamnesisTemplateSchema>;
export type AnamnesisFormInput = z.infer<typeof AnamnesisFormSchema>;

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Hook para validação de dados usando Zod
 * Fornece validação consistente para todos os tipos de dados
 */
export const useDataValidation = () => {
  // Função genérica de validação
  const validate = useCallback(<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        return {
          success: false,
          errors,
        };
      }

      return {
        success: false,
        errors: {
          general: ['Erro de validação desconhecido'],
        },
      };
    }
  }, []);

  // Validações específicas
  const validatePatient = useCallback((data: unknown): ValidationResult<PatientInput> => {
    return validate(PatientSchema, data);
  }, [validate]);

  const validateProfessional = useCallback((data: unknown): ValidationResult<ProfessionalInput> => {
    return validate(ProfessionalSchema, data);
  }, [validate]);

  const validateAppointment = useCallback((data: unknown): ValidationResult<AppointmentInput> => {
    return validate(AppointmentSchema, data);
  }, [validate]);

  const validateMaterial = useCallback((data: unknown): ValidationResult<MaterialInput> => {
    return validate(MaterialSchema, data);
  }, [validate]);

  const validateWaitingList = useCallback((data: unknown): ValidationResult<WaitingListInput> => {
    return validate(WaitingListSchema, data);
  }, [validate]);

  const validateAnamnesisTemplate = useCallback((data: unknown): ValidationResult<AnamnesisTemplateInput> => {
    return validate(AnamnesisTemplateSchema, data);
  }, [validate]);

  const validateAnamnesisForm = useCallback((data: unknown): ValidationResult<AnamnesisFormInput> => {
    return validate(AnamnesisFormSchema, data);
  }, [validate]);

  // Função para sanitizar dados antes de enviar para GraphQL
  const sanitizeForGraphQL = useCallback((data: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      // Remover campos undefined ou null
      if (value !== undefined && value !== null) {
        // Converter strings vazias para null em campos opcionais
        if (typeof value === 'string' && value.trim() === '') {
          sanitized[key] = null;
        } else {
          sanitized[key] = value;
        }
      }
    });

    return sanitized;
  }, []);

  // Função para validar conflitos de horário em agendamentos
  const validateAppointmentConflict = useCallback((
    newAppointment: { start_datetime: string; end_datetime: string; professional_id: string },
    existingAppointments: Array<{ start_datetime: string; end_datetime: string; professional_id: string; id: string }>,
    excludeId?: string
  ): { hasConflict: boolean; conflictingAppointment?: any } => {
    const newStart = new Date(newAppointment.start_datetime);
    const newEnd = new Date(newAppointment.end_datetime);

    const conflictingAppointment = existingAppointments.find((appointment) => {
      // Pular se for o mesmo agendamento (para updates)
      if (excludeId && appointment.id === excludeId) {
        return false;
      }

      // Verificar apenas agendamentos do mesmo profissional
      if (appointment.professional_id !== newAppointment.professional_id) {
        return false;
      }

      const existingStart = new Date(appointment.start_datetime);
      const existingEnd = new Date(appointment.end_datetime);

      // Verificar sobreposição
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    return {
      hasConflict: !!conflictingAppointment,
      conflictingAppointment,
    };
  }, []);

  // Função para validar horário de trabalho do profissional
  const validateWorkingHours = useCallback((
    appointmentDateTime: string,
    workingHours?: any
  ): boolean => {
    if (!workingHours) {
      return true; // Se não há horário definido, aceitar qualquer horário
    }

    const appointmentDate = new Date(appointmentDateTime);
    const dayOfWeek = appointmentDate.getDay(); // 0 = domingo, 1 = segunda, etc.
    const appointmentTime = appointmentDate.toTimeString().slice(0, 5); // HH:MM

    // Mapear dia da semana
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const daySchedule = workingHours[dayName];
    if (!daySchedule) {
      return false; // Profissional não trabalha neste dia
    }

    // Verificar se está dentro do horário de trabalho
    const { start, end, breaks } = daySchedule;
    
    if (appointmentTime < start || appointmentTime > end) {
      return false; // Fora do horário de trabalho
    }

    // Verificar intervalos (se houver)
    if (breaks && Array.isArray(breaks)) {
      const isInBreak = breaks.some((breakTime: any) => 
        appointmentTime >= breakTime.start && appointmentTime <= breakTime.end
      );
      
      if (isInBreak) {
        return false; // Durante intervalo
      }
    }

    return true;
  }, []);

  return {
    // Validações gerais
    validate,
    sanitizeForGraphQL,

    // Validações específicas
    validatePatient,
    validateProfessional,
    validateAppointment,
    validateMaterial,
    validateWaitingList,
    validateAnamnesisTemplate,
    validateAnamnesisForm,

    // Validações de negócio
    validateAppointmentConflict,
    validateWorkingHours,

    // Schemas exportados
    schemas: {
      PatientSchema,
      ProfessionalSchema,
      AppointmentSchema,
      MaterialSchema,
      WaitingListSchema,
      AnamnesisTemplateSchema,
      AnamnesisFormSchema,
    },
  };
};