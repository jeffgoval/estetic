import { useState, useCallback } from 'react';
import { usePatients } from './usePatients';
import type { Patient, CreatePatient } from '../../types';

export interface UsePatientFormOptions {
  onSuccess?: (patient: Patient) => void;
  onError?: (error: Error) => void;
}

export const usePatientForm = (options: UsePatientFormOptions = {}) => {
  const { createPatient, updatePatient } = usePatients();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPatient = useCallback(async (
    data: CreatePatient, 
    existingPatient?: Patient | null
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      let result: Patient;

      if (existingPatient) {
        // Atualizar paciente existente
        result = await updatePatient(existingPatient.id, data);
      } else {
        // Criar novo paciente
        result = await createPatient(data);
      }

      options.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar paciente';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createPatient, updatePatient, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    submitPatient,
    loading,
    error,
    reset,
  };
};