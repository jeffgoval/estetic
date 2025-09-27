/**
 * Configurações de monitoramento e observabilidade para produção
 */

// Configuração do Sentry para monitoramento de erros
export const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV || 'development',
  tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event: any) {
    // Filtrar erros conhecidos ou irrelevantes
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        // Ignorar erros de chunk loading (comum em deploys)
        return null;
      }
      if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
        // Ignorar erro conhecido do ResizeObserver
        return null;
      }
    }
    return event;
  },
  integrations: [
    // Integração com React Router
    // new Sentry.BrowserTracing({
    //   routingInstrumentation: Sentry.reactRouterV6Instrumentation(
    //     React.useEffect,
    //     useLocation,
    //     useNavigationType,
    //     createRoutesFromChildren,
    //     matchRoutes
    //   ),
    // }),
  ],
};

// Configuração de métricas de performance
export const performanceConfig = {
  enabled: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  sampleRate: 0.1, // 10% das sessões
  thresholds: {
    // Limites para alertas de performance
    firstContentfulPaint: 2000, // 2s
    largestContentfulPaint: 4000, // 4s
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1,
    timeToInteractive: 5000, // 5s
  },
};

// Configuração de analytics (respeitando privacidade)
export const analyticsConfig = {
  enabled: import.meta.env.VITE_APP_ENV === 'production',
  anonymizeIp: true,
  respectDoNotTrack: true,
  cookieConsent: true,
  events: {
    // Eventos importantes para acompanhar
    userLogin: 'user_login',
    patientCreated: 'patient_created',
    appointmentScheduled: 'appointment_scheduled',
    reportGenerated: 'report_generated',
    featureUsed: 'feature_used',
  },
};

// Configuração de logs
export const loggingConfig = {
  level: import.meta.env.VITE_APP_ENV === 'production' ? 'error' : 'debug',
  enableConsole: import.meta.env.VITE_DEBUG_MODE === 'true',
  enableRemote: import.meta.env.VITE_APP_ENV === 'production',
  maxLogSize: 1000, // Máximo de logs em memória
  batchSize: 10, // Enviar logs em lotes
  flushInterval: 30000, // 30 segundos
};

// Configuração de cache
export const cacheConfig = {
  version: import.meta.env.VITE_CACHE_VERSION || '1.0.0',
  ttl: {
    // Tempo de vida do cache em milissegundos
    queries: 5 * 60 * 1000, // 5 minutos
    mutations: 0, // Não cachear mutations
    static: 24 * 60 * 60 * 1000, // 24 horas
  },
  maxSize: 50, // Máximo de entradas no cache
  strategy: 'lru', // Least Recently Used
};

// Configuração de rate limiting (lado cliente)
export const rateLimitConfig = {
  enabled: true,
  limits: {
    // Limites por minuto
    queries: 100,
    mutations: 30,
    uploads: 10,
  },
  windowMs: 60 * 1000, // 1 minuto
};

// Configuração de health checks
export const healthCheckConfig = {
  enabled: import.meta.env.VITE_APP_ENV === 'production',
  interval: 30000, // 30 segundos
  timeout: 5000, // 5 segundos
  endpoints: {
    graphql: '/v1/graphql',
    auth: '/v1/auth/user',
    storage: '/v1/storage/files',
  },
  retries: 3,
};

// Configuração de feature flags
export const featureFlagsConfig = {
  enabled: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutos
  fallbackValues: {
    // Valores padrão caso não consiga carregar
    whatsapp_integration: false,
    ai_agent: false,
    advanced_reports: true,
    multi_clinic: false,
  },
};

// Utilitários para monitoramento
export const monitoring = {
  // Medir performance de uma função
  measurePerformance: <T>(name: string, fn: () => T): T => {
    if (!performanceConfig.enabled) return fn();
    
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    // Enviar métrica para Sentry ou outro serviço
    console.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    return result;
  },

  // Reportar erro customizado
  reportError: (error: Error, context?: Record<string, any>) => {
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.error('Error:', error, context);
      return;
    }

    // Em produção, enviar para Sentry
    // Sentry.captureException(error, { extra: context });
  },

  // Reportar evento de analytics
  trackEvent: (event: string, properties?: Record<string, any>) => {
    if (!analyticsConfig.enabled) return;
    
    // Implementar tracking respeitando privacidade
    console.debug('Analytics:', event, properties);
  },

  // Verificar saúde da aplicação
  checkHealth: async (): Promise<boolean> => {
    if (!healthCheckConfig.enabled) return true;

    try {
      // Verificar conectividade com GraphQL
      const response = await fetch('/v1/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default {
  sentry: sentryConfig,
  performance: performanceConfig,
  analytics: analyticsConfig,
  logging: loggingConfig,
  cache: cacheConfig,
  rateLimit: rateLimitConfig,
  healthCheck: healthCheckConfig,
  featureFlags: featureFlagsConfig,
  monitoring,
};