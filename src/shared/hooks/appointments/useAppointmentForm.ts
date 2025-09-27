import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppointmentActions } from './useAppointmentActions';
import { useTimeSlotValidation } from './useTimeSlotValidation';

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  startDatetime: z.string().min(1, 'Data e hora de início são obrigatórias'),
  endDatetime: z.string().min(1, 'Data e hora de fim são obrigatórias'),
  serviceType: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface UseAppointmentFormProps {
  initialData?: Partial<AppointmentFormData>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useAppointmentForm = ({
  initialData,
  onSuccess,
  onError,
}: UseAppointmentFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createAppointment, updateAppointment } = useAppointmentActions();
  const { validateTimeSlot } = useTimeSlotValidation();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: initialData?.patientId || '',
      professionalId: initialData?.professionalId || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      startDatetime: initialData?.startDatetime || '',
      endDatetime: initialData?.endDatetime || '',
      serviceType: initialData?.serviceType || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);

    try {
      // Validar horário antes de submeter
      const validation = validateTimeSlot(
        data.professionalId,
        data.startDatetime,
        data.endDatetime
      );

      if (!validation.isValid) {
        form.setError('startDatetime', {
          message: validation.message || 'Horário inválido'
        });
        onError?.(validation.message || 'Horário inválido');
        return;
      }

      // Criar ou atualizar agendamento
      if (initialData?.patientId) {
        // Modo edição - assumindo que temos um ID
        // updateAppointment({ id: initialData.id, data });
      } else {
        // Modo criação
        createAppointment({
          patientId: data.patientId,
          professionalId: data.professionalId,
          title: data.title,
          description: data.description,
          startDatetime: data.startDatetime,
          endDatetime: data.endDatetime,
          serviceType: data.serviceType,
          notes: data.notes,
        });
      }

      onSuccess?.();
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar agendamento';
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndTime = (startDatetime: string, durationMinutes: number = 60) => {
    if (!startDatetime) return '';
    
    const startDate = new Date(startDatetime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    return endDate.toISOString().slice(0, 16); // Format para datetime-local input
  };

  const validateTimeSlotField = (professionalId: string, startDatetime: string, endDatetime: string) => {
    if (!professionalId || !startDatetime || !endDatetime) return;

    const validation = validateTimeSlot(professionalId, startDatetime, endDatetime);
    
    if (!validation.isValid) {
      form.setError('startDatetime', {
        message: validation.message || 'Horário inválido'
      });
    } else {
      form.clearErrors('startDatetime');
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    calculateEndTime,
    validateTimeSlotField,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
};