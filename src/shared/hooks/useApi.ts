import { useState, useCallback } from 'react';
import { useUIStore } from '../stores/useUIStore';
import { nhost } from '../config/nhost';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  loadingKey?: string;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showErrorToast, showSuccessToast, setLoadingState } = useUIStore();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options: UseApiOptions = {}
  ) => {
    const {
      showErrorToast: showError = true,
      showSuccessToast: showSuccess = false,
      successMessage = 'Operação realizada com sucesso',
      loadingKey,
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (loadingKey) {
      setLoadingState(loadingKey, true);
    }

    try {
      const data = await apiCall();
      
      setState({
        data,
        loading: false,
        error: null,
      });

      if (showSuccess) {
        showSuccessToast(successMessage);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      if (showError) {
        showErrorToast('Erro na operação', errorMessage);
      }

      throw error;
    } finally {
      if (loadingKey) {
        setLoadingState(loadingKey, false);
      }
    }
  }, [showErrorToast, showSuccessToast, setLoadingState]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Método para executar queries GraphQL
  const graphql = useCallback(async (
    query: string,
    variables?: Record<string, any>,
    options: UseApiOptions = {}
  ) => {
    return execute(async () => {
      const response = await nhost.graphql.request(query, variables);
      
      if (response.error) {
        throw new Error(response.error.message || 'Erro na consulta GraphQL');
      }
      
      return response;
    }, options);
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    api: {
      graphql,
    },
  };
}