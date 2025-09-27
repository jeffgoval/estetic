import { useMemo } from 'react';
import { useAppointments } from './useAppointments';
import { useProfessionals } from '../professionals/useProfessionals';

interface TimeSlot {
  start: string;
  end: string;
}

interface ValidationResult {
  isValid: boolean;
  conflicts: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
  }>;
  message?: string;
}

export const useTimeSlotValidation = () => {
  const { appointments } = useAppointments();
  const { professionals } = useProfessionals();

  const validateTimeSlot = useMemo(() => {
    return (
      professionalId: string,
      startDatetime: string,
      endDatetime: string,
      excludeAppointmentId?: string
    ): ValidationResult => {
      const startTime = new Date(startDatetime);
      const endTime = new Date(endDatetime);

      // Validações básicas
      if (startTime >= endTime) {
        return {
          isValid: false,
          conflicts: [],
          message: 'Horário de início deve ser anterior ao horário de fim'
        };
      }

      if (startTime < new Date()) {
        return {
          isValid: false,
          conflicts: [],
          message: 'Não é possível agendar no passado'
        };
      }

      // Verificar horário de funcionamento do profissional
      const professional = professionals.find(p => p.id === professionalId);
      if (professional?.workingHours) {
        const dayOfWeek = startTime.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
        const workingHours = professional.workingHours[dayOfWeek];
        
        if (!workingHours) {
          return {
            isValid: false,
            conflicts: [],
            message: 'Profissional não trabalha neste dia da semana'
          };
        }

        const startHour = startTime.getHours() * 60 + startTime.getMinutes();
        const endHour = endTime.getHours() * 60 + endTime.getMinutes();
        const workStart = parseInt(workingHours.start.split(':')[0]) * 60 + parseInt(workingHours.start.split(':')[1]);
        const workEnd = parseInt(workingHours.end.split(':')[0]) * 60 + parseInt(workingHours.end.split(':')[1]);

        if (startHour < workStart || endHour > workEnd) {
          return {
            isValid: false,
            conflicts: [],
            message: `Horário fora do expediente (${workingHours.start} às ${workingHours.end})`
          };
        }

        // Verificar intervalos/pausas
        if (workingHours.breaks) {
          for (const breakTime of workingHours.breaks) {
            const breakStart = parseInt(breakTime.start.split(':')[0]) * 60 + parseInt(breakTime.start.split(':')[1]);
            const breakEnd = parseInt(breakTime.end.split(':')[0]) * 60 + parseInt(breakTime.end.split(':')[1]);

            if ((startHour >= breakStart && startHour < breakEnd) || 
                (endHour > breakStart && endHour <= breakEnd) ||
                (startHour <= breakStart && endHour >= breakEnd)) {
              return {
                isValid: false,
                conflicts: [],
                message: `Horário conflita com intervalo (${breakTime.start} às ${breakTime.end})`
              };
            }
          }
        }
      }

      // Verificar conflitos com outros agendamentos
      const conflicts = appointments
        .filter(appointment => 
          appointment.professionalId === professionalId &&
          appointment.id !== excludeAppointmentId &&
          appointment.status !== 'cancelled' &&
          appointment.status !== 'no_show'
        )
        .filter(appointment => {
          const appointmentStart = new Date(appointment.startDatetime);
          const appointmentEnd = new Date(appointment.endDatetime);

          // Verificar sobreposição de horários
          return (
            (startTime >= appointmentStart && startTime < appointmentEnd) ||
            (endTime > appointmentStart && endTime <= appointmentEnd) ||
            (startTime <= appointmentStart && endTime >= appointmentEnd)
          );
        })
        .map(appointment => ({
          id: appointment.id,
          title: appointment.title,
          start: appointment.startDatetime,
          end: appointment.endDatetime,
        }));

      if (conflicts.length > 0) {
        return {
          isValid: false,
          conflicts,
          message: `Conflito com ${conflicts.length} agendamento(s) existente(s)`
        };
      }

      return {
        isValid: true,
        conflicts: [],
      };
    };
  }, [appointments, professionals]);

  const getAvailableTimeSlots = useMemo(() => {
    return (
      professionalId: string,
      date: string,
      duration: number = 60 // duração em minutos
    ): TimeSlot[] => {
      const professional = professionals.find(p => p.id === professionalId);
      if (!professional?.workingHours) return [];

      const targetDate = new Date(date);
      const dayOfWeek = targetDate.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
      const workingHours = professional.workingHours[dayOfWeek];
      
      if (!workingHours) return [];

      const slots: TimeSlot[] = [];
      const workStart = parseInt(workingHours.start.split(':')[0]) * 60 + parseInt(workingHours.start.split(':')[1]);
      const workEnd = parseInt(workingHours.end.split(':')[0]) * 60 + parseInt(workingHours.end.split(':')[1]);

      // Gerar slots de tempo disponíveis
      for (let time = workStart; time + duration <= workEnd; time += 30) { // slots de 30 em 30 minutos
        const startHour = Math.floor(time / 60);
        const startMinute = time % 60;
        const endTime = time + duration;
        const endHour = Math.floor(endTime / 60);
        const endMinute = endTime % 60;

        const startDatetime = new Date(targetDate);
        startDatetime.setHours(startHour, startMinute, 0, 0);
        
        const endDatetime = new Date(targetDate);
        endDatetime.setHours(endHour, endMinute, 0, 0);

        // Verificar se o slot está disponível
        const validation = validateTimeSlot(
          professionalId,
          startDatetime.toISOString(),
          endDatetime.toISOString()
        );

        if (validation.isValid) {
          slots.push({
            start: startDatetime.toISOString(),
            end: endDatetime.toISOString(),
          });
        }
      }

      return slots;
    };
  }, [professionals, validateTimeSlot]);

  return {
    validateTimeSlot,
    getAvailableTimeSlots,
  };
};