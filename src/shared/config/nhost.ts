import { NhostClient } from '@nhost/nhost-js';

// Configuração do cliente Nhost
export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'localhost',
  region: import.meta.env.VITE_NHOST_REGION || 'local',
  
  // Configurações adicionais para desenvolvimento
  ...(import.meta.env.DEV && {
    adminSecret: 'nhost-admin-secret', // Apenas para desenvolvimento
  }),

  // Configurações de autenticação
  auth: {
    // Configurar Google OAuth se disponível
    ...(import.meta.env.VITE_GOOGLE_CLIENT_ID && {
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    }),
  },

  // Configurações de storage
  storage: {
    // Configurações específicas de storage se necessário
  },
});

// URLs customizadas se especificadas
if (import.meta.env.VITE_GRAPHQL_URL) {
  // Sobrescrever URL do GraphQL se especificada
  console.log('Usando URL GraphQL customizada:', import.meta.env.VITE_GRAPHQL_URL);
}

// Log de configuração em desenvolvimento
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Configuração Nhost:', {
    subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
    region: import.meta.env.VITE_NHOST_REGION,
    graphqlUrl: nhost.graphql.getUrl(),
    authUrl: nhost.auth.getUrl(),
    storageUrl: nhost.storage.getUrl(),
  });
}

// Re-exportar tipos do módulo de tipos
export type { AuthUser, Tenant, UserWithTenant, Role, Permission } from '../types/auth';