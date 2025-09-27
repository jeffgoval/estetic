import { useState, useEffect } from 'react';

interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  professionalId: number;
  professionalName: string;
}

interface UseAvailableSlotsReturn {
  availableSlots: AvailableSlot[];
  loading: boolean;
  error: string | null;
  searchSlots: (criteria: SlotSearchCriteria) => Promise<void>;
}

interface SlotSearchCriteria {
  professionalId?: number;
  preferredDate?: string;
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
  durationMinutes?: number;
  daysAhead?: number;
}

const useAvailableSlots = (): UseAvailableSlotsReturn => {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSlots = async (criteria: SlotSearchCriteria) => {
    try {
      setLoading(true);
      setError(null);

      // Construir query params
      const params = new URLSearchParams();
      if (criteria.professionalId) params.append('professional_id', criteria.professionalId.toString());
      if (criteria.preferredDate) params.append('preferred_date', criteria.preferredDate);
      if (criteria.preferredTimeStart) params.append('preferred_time_start', criteria.preferredTimeStart);
      if (criteria.preferredTimeEnd) params.append('preferred_time_end', criteria.preferredTimeEnd);
      if (criteria.durationMinutes) params.append('duration_minutes', criteria.durationMinutes.toString());
      if (criteria.daysAhead) params.append('days_ahead', criteria.daysAhead.toString());

      const response = await fetch(`/api/appointments/available-slots?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis');
      }

      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    availableSlots,
    loading,
    error,
    searchSlots,
  };
};

export default useAvailableSlots;