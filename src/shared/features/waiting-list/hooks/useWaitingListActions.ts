import { useState } from 'react';
import type { CreateWaitingList, CreateAppointment } from '../../types';

interface UseWaitingListActionsReturn {
  loading: boolean;
  error: string | null;
  addToWaitingList: (data: CreateWaitingList) => Promise<boolean>;
  updateWaitingListEntry: (id: number, data: Partial<CreateWaitingList>) => Promise<boolean>;
  removeFromWaitingList: (id: number) => Promise<boolean>;
  scheduleFromWaitingList: (waitingListId: number, appointmentData: CreateAppointment) => Promise<boolean>;
  updatePriority: (id: number, priority: number) => Promise<boolean>;
  contactPatient: (id: number, method: 'phone' | 'whatsapp' | 'email') => Promise<boolean>;
}

const useWaitingListActions = (): UseWaitingListActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async (url: string, options: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro na operação');
    }

    return response.json();
  };

  const addToWaitingList = async (data: CreateWaitingList): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await makeRequest('/api/waiting-list', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar à lista de espera');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateWaitingListEntry = async (id: number, data: Partial<CreateWaitingList>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await makeRequest(`/api/waiting-list/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar entrada da lista de espera');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWaitingList = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await makeRequest(`/api/waiting-list/${id}`, {
        method: 'DELETE',
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover da lista de espera');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const scheduleFromWaitingList = async (waitingListId: number, appointmentData: CreateAppointment): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Criar o agendamento
      await makeRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });

      // Atualizar status da lista de espera para 'scheduled'
      await makeRequest(`/api/waiting-list/${waitingListId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'scheduled' }),
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar da lista de espera');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePriority = async (id: number, priority: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await makeRequest(`/api/waiting-list/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ priority }),
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar prioridade');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contactPatient = async (id: number, method: 'phone' | 'whatsapp' | 'email'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await makeRequest(`/api/waiting-list/${id}/contact`, {
        method: 'POST',
        body: JSON.stringify({ method }),
      });

      // Atualizar status para 'contacted'
      await makeRequest(`/api/waiting-list/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'contacted' }),
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao contatar paciente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addToWaitingList,
    updateWaitingListEntry,
    removeFromWaitingList,
    scheduleFromWaitingList,
    updatePriority,
    contactPatient,
  };
};

export default useWaitingListActions;