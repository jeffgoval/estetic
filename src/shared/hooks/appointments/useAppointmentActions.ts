import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppointmentsStore } from '../../stores/useAppointmentsStore';
import { useApi } from '../useApi';
import { Appointment } from '../../types';

interface CreateAppointmentData {
  patientId: string;
  professionalId: string;
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  serviceType?: string;
  notes?: string;
}

interface UpdateAppointmentData {
  title?: string;
  description?: string;
  startDatetime?: string;
  endDatetime?: string;
  status?: Appointment['status'];
  serviceType?: string;
  notes?: string;
}

export const useAppointmentActions = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();
  const { 
    addAppointment, 
    updateAppointment: updateAppointmentStore, 
    removeAppointment,
    setError 
  } = useAppointmentsStore();

  const createAppointment = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      const response = await api.graphql(`
        mutation CreateAppointment($data: appointments_insert_input!) {
          insert_appointments_one(object: $data) {
            id
            tenant_id
            patient_id
            professional_id
            title
            description
            start_datetime
            end_datetime
            status
            service_type
            notes
            created_by
            created_at
            updated_at
            patient {
              id
              name
              phone
              email
            }
            professional {
              id
              name
              specialty
            }
          }
        }
      `, {
        data: {
          patient_id: data.patientId,
          professional_id: data.professionalId,
          title: data.title,
          description: data.description,
          start_datetime: data.startDatetime,
          end_datetime: data.endDatetime,
          service_type: data.serviceType,
          notes: data.notes,
          status: 'scheduled',
        }
      });

      return response.data?.insert_appointments_one;
    },
    onSuccess: (newAppointment) => {
      if (newAppointment) {
        addAppointment(newAppointment);
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar agendamento';
      setError(errorMessage);
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAppointmentData }) => {
      const response = await api.graphql(`
        mutation UpdateAppointment($id: uuid!, $data: appointments_set_input!) {
          update_appointments_by_pk(pk_columns: {id: $id}, _set: $data) {
            id
            tenant_id
            patient_id
            professional_id
            title
            description
            start_datetime
            end_datetime
            status
            service_type
            notes
            created_by
            created_at
            updated_at
            patient {
              id
              name
              phone
              email
            }
            professional {
              id
              name
              specialty
            }
          }
        }
      `, {
        id,
        data: {
          title: data.title,
          description: data.description,
          start_datetime: data.startDatetime,
          end_datetime: data.endDatetime,
          status: data.status,
          service_type: data.serviceType,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        }
      });

      return response.data?.update_appointments_by_pk;
    },
    onSuccess: (updatedAppointment) => {
      if (updatedAppointment) {
        updateAppointmentStore(updatedAppointment.id, updatedAppointment);
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.graphql(`
        mutation DeleteAppointment($id: uuid!) {
          delete_appointments_by_pk(id: $id) {
            id
          }
        }
      `, { id });

      return response.data?.delete_appointments_by_pk;
    },
    onSuccess: (deletedAppointment) => {
      if (deletedAppointment) {
        removeAppointment(deletedAppointment.id);
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir agendamento';
      setError(errorMessage);
    },
  });

  const rescheduleAppointment = useMutation({
    mutationFn: async ({ 
      id, 
      newStartDatetime, 
      newEndDatetime 
    }: { 
      id: string; 
      newStartDatetime: string; 
      newEndDatetime: string; 
    }) => {
      return updateAppointment.mutateAsync({
        id,
        data: {
          startDatetime: newStartDatetime,
          endDatetime: newEndDatetime,
        }
      });
    },
  });

  return {
    createAppointment: createAppointment.mutate,
    updateAppointment: updateAppointment.mutate,
    deleteAppointment: deleteAppointment.mutate,
    rescheduleAppointment: rescheduleAppointment.mutate,
    isCreating: createAppointment.isPending,
    isUpdating: updateAppointment.isPending,
    isDeleting: deleteAppointment.isPending,
    isRescheduling: rescheduleAppointment.isPending,
  };
};