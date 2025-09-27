import { useQuery, QueryHookOptions, DocumentNode } from '@apollo/client';
import { useDebounce } from './useDebounce';
import { useMemo } from 'react';

interface OptimizedQueryOptions<TData, TVariables> extends QueryHookOptions<TData, TVariables> {
  debounceMs?: number;
  enableDebounce?: boolean;
}

export function useOptimizedQuery<TData = any, TVariables = any>(
  query: DocumentNode,
  options: OptimizedQueryOptions<TData, TVariables> = {}
) {
  const {
    debounceMs = 300,
    enableDebounce = false,
    variables,
    ...queryOptions
  } = options;

  // Aplicar debounce nas variáveis se habilitado
  const debouncedVariables = useDebounce(variables, enableDebounce ? debounceMs : 0);
  const finalVariables = enableDebounce ? debouncedVariables : variables;

  // Otimizações de cache baseadas no tipo de query
  const optimizedOptions = useMemo(() => {
    const baseOptions = {
      ...queryOptions,
      variables: finalVariables,
      // Configurações padrão otimizadas
      fetchPolicy: queryOptions.fetchPolicy || 'cache-first',
      errorPolicy: queryOptions.errorPolicy || 'all',
      notifyOnNetworkStatusChange: true,
    };

    // Se as variáveis mudaram recentemente, usar network-only para dados frescos
    if (enableDebounce && finalVariables !== variables) {
      return {
        ...baseOptions,
        fetchPolicy: 'network-only' as const,
      };
    }

    return baseOptions;
  }, [queryOptions, finalVariables, variables, enableDebounce]);

  const result = useQuery<TData, TVariables>(query, optimizedOptions);

  return {
    ...result,
    // Adicionar informações úteis para debugging
    isDebouncing: enableDebounce && finalVariables !== variables,
    cacheStatus: result.loading ? 'loading' : result.data ? 'hit' : 'miss',
  };
}