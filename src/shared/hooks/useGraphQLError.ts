import { useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { useUIStore } from '../stores/useUIStore';

interface GraphQLErrorDetails {
  message: string;
  code?: string;
  field?: string;
  path?: string[];
}

/**
 * Hook para tratamento de erros GraphQL
 * Fornece funções para processar e exibir erros de forma consistente
 */
export const useGraphQLError = () => {
  const { showErrorToast, showWarningToast } = useUIStore();

  // Processar erro do Apollo/GraphQL
  const processApolloError = useCallback((error: ApolloError): GraphQLErrorDetails[] => {
    const errors: GraphQLErrorDetails[] = [];

    // Processar erros GraphQL
    if (error.graphQLErrors?.length > 0) {
      error.graphQLErrors.forEach((gqlError) => {
        errors.push({
          message: gqlError.message,
          code: gqlError.extensions?.code as string,
          field: gqlError.extensions?.field as string,
          path: gqlError.path as string[],
        });
      });
    }

    // Processar erros de rede
    if (error.networkError) {
      errors.push({
        message: 'Erro de conexão com o servidor',
        code: 'NETWORK_ERROR',
      });
    }

    // Se não houver erros específicos, usar mensagem genérica
    if (errors.length === 0) {
      errors.push({
        message: error.message || 'Erro desconhecido',
        code: 'UNKNOWN_ERROR',
      });
    }

    return errors;
  }, []);

  // Exibir erro com toast
  const showError = useCallback((error: ApolloError | Error | string, title?: string) => {
    if (typeof error === 'string') {
      showErrorToast(title || 'Erro', error);
      return;
    }

    if (error instanceof ApolloError) {
      const processedErrors = processApolloError(error);
      
      processedErrors.forEach((err) => {
        // Personalizar mensagens baseadas no código do erro
        let displayMessage = err.message;
        let displayTitle = title || 'Erro';

        switch (err.code) {
          case 'permission-error':
            displayTitle = 'Acesso Negado';
            displayMessage = 'Você não tem permissão para realizar esta ação';
            break;
          case 'validation-failed':
            displayTitle = 'Dados Inválidos';
            displayMessage = err.field 
              ? `Campo ${err.field}: ${err.message}`
              : 'Verifique os dados informados';
            break;
          case 'constraint-violation':
            displayTitle = 'Conflito de Dados';
            displayMessage = 'Este registro já existe ou viola uma restrição';
            break;
          case 'not-found':
            displayTitle = 'Não Encontrado';
            displayMessage = 'O registro solicitado não foi encontrado';
            break;
          case 'NETWORK_ERROR':
            displayTitle = 'Erro de Conexão';
            displayMessage = 'Verifique sua conexão com a internet';
            break;
          default:
            // Manter mensagem original para outros erros
            break;
        }

        showErrorToast(displayTitle, displayMessage);
      });
    } else {
      // Erro genérico
      showErrorToast(title || 'Erro', error.message || 'Erro desconhecido');
    }
  }, [processApolloError, showErrorToast]);

  // Exibir aviso
  const showWarning = useCallback((message: string, title?: string) => {
    showWarningToast(title || 'Atenção', message);
  }, [showWarningToast]);

  // Verificar se é erro de permissão
  const isPermissionError = useCallback((error: ApolloError): boolean => {
    return error.graphQLErrors?.some(
      err => err.extensions?.code === 'permission-error'
    ) || false;
  }, []);

  // Verificar se é erro de validação
  const isValidationError = useCallback((error: ApolloError): boolean => {
    return error.graphQLErrors?.some(
      err => err.extensions?.code === 'validation-failed'
    ) || false;
  }, []);

  // Verificar se é erro de rede
  const isNetworkError = useCallback((error: ApolloError): boolean => {
    return !!error.networkError;
  }, []);

  // Obter mensagem de erro amigável
  const getFriendlyErrorMessage = useCallback((error: ApolloError | Error | string): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof ApolloError) {
      const processedErrors = processApolloError(error);
      
      if (processedErrors.length > 0) {
        const firstError = processedErrors[0];
        
        switch (firstError.code) {
          case 'permission-error':
            return 'Você não tem permissão para realizar esta ação';
          case 'validation-failed':
            return 'Verifique os dados informados';
          case 'constraint-violation':
            return 'Este registro já existe ou viola uma restrição';
          case 'not-found':
            return 'Registro não encontrado';
          case 'NETWORK_ERROR':
            return 'Erro de conexão. Verifique sua internet';
          default:
            return firstError.message;
        }
      }
    }

    return error.message || 'Erro desconhecido';
  }, [processApolloError]);

  return {
    // Funções principais
    showError,
    showWarning,
    processApolloError,
    getFriendlyErrorMessage,

    // Verificações de tipo de erro
    isPermissionError,
    isValidationError,
    isNetworkError,
  };
};