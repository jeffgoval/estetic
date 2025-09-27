import React, { useEffect } from 'react';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { FormField } from '../../molecules/FormField';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { useAppointmentForm } from '../../../hooks/appointments/useAppointmentForm';
import { usePatients } from '../../../hooks/patients/usePatients';
import { useProfessionals } from '../../../hooks/professionals/useProfessionals';
import { useTimeSlotValidation } from '../../../hooks/appointments/useTimeSlotValidation';
import { cn } from '../../../utils/cn';

interface AppointmentFormProps {
  initialData?: {
    id?: string;
    patientId?: string;
    professionalId?: string;
    title?: string;
    description?: string;
    startDatetime?: string;
    endDatetime?: string;
    serviceType?: string;
    notes?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  className,
}) => {
  const { patients } = usePatients();
  const { professionals } = useProfessionals();
  const { getAvailableTimeSlots } = useTimeSlotValidation();

  const {
    form,
    handleSubmit,
    isSubmitting,
    calculateEndTime,
    validateTimeSlotField,
    errors,
  } = useAppointmentForm({
    initialData,
    onSuccess,
    onError: (error) => {
      console.error('Erro no formulário:', error);
    },
  });

  const { register, watch, setValue, formState } = form;
  const watchedValues = watch();

  // Calcular horário de fim automaticamente quando o início muda
  useEffect(() => {
    if (watchedValues.startDatetime && !initialData?.endDatetime) {
      const endTime = calculateEndTime(watchedValues.startDatetime, 60);
      setValue('endDatetime', endTime);
    }
  }, [watchedValues.startDatetime, setValue, calculateEndTime, initialData?.endDatetime]);

  // Validar horário quando os campos relevantes mudam
  useEffect(() => {
    if (watchedValues.professionalId && watchedValues.startDatetime && watchedValues.endDatetime) {
      validateTimeSlotField(
        watchedValues.professionalId,
        watchedValues.startDatetime,
        watchedValues.endDatetime
      );
    }
  }, [
    watchedValues.professionalId,
    watchedValues.startDatetime,
    watchedValues.endDatetime,
    validateTimeSlotField,
  ]);

  const serviceTypes = [
    'Consulta',
    'Limpeza de Pele',
    'Peeling',
    'Botox',
    'Preenchimento',
    'Laser',
    'Microagulhamento',
    'Drenagem Linfática',
    'Massagem Relaxante',
    'Outros',
  ];

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <Text variant="h3" weight="semibold">
          {initialData?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
        </Text>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <Icon name="X" size={16} />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paciente */}
        <FormField
          label="Paciente"
          error={errors.patientId?.message}
          required
        >
          <select
            {...register('patientId')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione um paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </FormField>

        {/* Profissional */}
        <FormField
          label="Profissional"
          error={errors.professionalId?.message}
          required
        >
          <select
            {...register('professionalId')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione um profissional</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name} {professional.specialty && `- ${professional.specialty}`}
              </option>
            ))}
          </select>
        </FormField>

        {/* Título */}
        <FormField
          label="Título"
          error={errors.title?.message}
          required
        >
          <input
            type="text"
            {...register('title')}
            placeholder="Ex: Consulta de avaliação"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </FormField>

        {/* Tipo de Serviço */}
        <FormField
          label="Tipo de Serviço"
          error={errors.serviceType?.message}
        >
          <select
            {...register('serviceType')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione o tipo de serviço</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Data e Hora de Início"
            error={errors.startDatetime?.message}
            required
          >
            <input
              type="datetime-local"
              {...register('startDatetime')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </FormField>

          <FormField
            label="Data e Hora de Fim"
            error={errors.endDatetime?.message}
            required
          >
            <input
              type="datetime-local"
              {...register('endDatetime')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </FormField>
        </div>

        {/* Horários Disponíveis */}
        {watchedValues.professionalId && watchedValues.startDatetime && (
          <div className="p-4 bg-neutral-50 rounded-md">
            <Text variant="small" weight="medium" className="mb-2">
              Horários disponíveis para este profissional:
            </Text>
            <div className="flex flex-wrap gap-2">
              {getAvailableTimeSlots(
                watchedValues.professionalId,
                watchedValues.startDatetime.split('T')[0],
                60
              ).slice(0, 6).map((slot, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setValue('startDatetime', slot.start.slice(0, 16));
                    setValue('endDatetime', slot.end.slice(0, 16));
                  }}
                  className="text-xs"
                >
                  {new Date(slot.start).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Descrição */}
        <FormField
          label="Descrição"
          error={errors.description?.message}
        >
          <textarea
            {...register('description')}
            placeholder="Descrição adicional do agendamento"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </FormField>

        {/* Observações */}
        <FormField
          label="Observações"
          error={errors.notes?.message}
        >
          <textarea
            {...register('notes')}
            placeholder="Observações internas"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </FormField>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!formState.isValid}
          >
            <Icon name="Calendar" size={16} className="mr-2" />
            {initialData?.id ? 'Atualizar' : 'Agendar'}
          </Button>
        </div>
      </form>
    </Card>
  );
};