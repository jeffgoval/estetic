import { useState, useEffect } from 'react';
import type { WaitingList, Patient, Professional } from '../../types';

interface WaitingListWithDetails extends WaitingList {
  patient_name?: string;
  patient_phone?: string;
  professional_name?: string;
}

interface UseWaitingListReturn {
  waitingList: WaitingListWithDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

interface UseWaitingListOptions {
  status?: string;
  priority?: number;
  professionalId?: number;
  patientId?: number;
}

const useWaitingList = (options: UseWaitingListOptions = {}): UseWaitingListReturn => {
  const [waitingList, setWaitingList] = useState<WaitingListWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWaitingList = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query params
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.priority) params.append('priority', options.priority.toString());
      if (options.professionalId) params.append('professional_id', options.professionalId.toString());
      if (options.patientId) params.append('patient_id', options.patientId.toString());

      const response = await fetch(`/api/waiting-list?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar lista de espera');
      }

      const data = await response.json();
      setWaitingList(data.results || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, [options.status, options.priority, options.professionalId, options.patientId]);

  return {
    waitingList,
    loading,
    error,
    refetch: fetchWaitingList,
    totalCount,
  };
};

export default useWaitingList;