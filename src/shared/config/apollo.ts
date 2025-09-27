import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { nhost } from './nhost';

// URLs do GraphQL
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || nhost.graphql.getUrl();
const graphqlWsUrl = import.meta.env.VITE_GRAPHQL_WS_URL || graphqlUrl.replace('http', 'ws');

// Link HTTP para queries e mutations
const httpLink = createHttpLink({
  uri: graphqlUrl,
});

// Link WebSocket para subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: graphqlWsUrl,
    connectionParams: () => {
      const token = nhost.auth.getAccessToken();
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
  })
);

// Link de autenticação
const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Link de tratamento de erros otimizado
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Se for erro de autenticação, tentar renovar o token
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // O Nhost já gerencia a renovação automática do token
      // Apenas logamos o erro aqui
      console.warn('Token de autenticação expirado ou inválido');
    }
  }
});

// Dividir entre HTTP e WebSocket baseado no tipo de operação
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

// Configuração do cache com otimizações avançadas
const cache = new InMemoryCache({
  typePolicies: {
    // Configurações de cache para otimizar queries
    Query: {
      fields: {
        patients: {
          merge(_, incoming) {
            return incoming;
          },
        },
        appointments: {
          merge(_, incoming) {
            return incoming;
          },
        },
        professionals: {
          merge(_, incoming) {
            return incoming;
          },
        },
        materials: {
          merge(_, incoming) {
            return incoming;
          },
        },
        waiting_list: {
          merge(_, incoming) {
            return incoming;
          },
        },
        anamnesis_templates: {
          merge(_, incoming) {
            return incoming;
          },
        },
        anamnesis_forms: {
          merge(_, incoming) {
            return incoming;
          },
        },
        tenants: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    // Configurações específicas para entidades
    Patient: {
      fields: {
        appointments: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Professional: {
      fields: {
        appointments: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Appointment: {
      fields: {
        patient: {
          merge: true,
        },
        professional: {
          merge: true,
        },
      },
    },
  },
  // Configurações de garbage collection para otimizar memória
  possibleTypes: {},
  dataIdFromObject: (object: any) => {
    // Usar ID customizado para melhor cache
    if (object.__typename && object.id) {
      return `${object.__typename}:${object.id}`;
    }
    return null;
  },
});

// Cliente Apollo com otimizações de performance
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first', // Priorizar cache para melhor performance
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
      // Atualizar cache após mutations
      refetchQueries: 'active',
      awaitRefetchQueries: false, // Não esperar refetch para melhor UX
    },
  },
  // Configurações de performance
  assumeImmutableResults: true, // Assumir que os dados são imutáveis
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Função para resetar o cache (útil para logout)
export const resetApolloCache = () => {
  apolloClient.resetStore();
};

// Função para refetch todas as queries ativas
export const refetchActiveQueries = () => {
  apolloClient.refetchQueries({
    include: 'active',
  });
};

// Hook personalizado para verificar status da conexão
export const useApolloNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Refetch queries quando voltar online
      refetchActiveQueries();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

// Importar React para o hook
import React from 'react';