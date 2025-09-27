import { createContext, useContext, ReactNode, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceContextType {
  reportSlowRender: (metrics: PerformanceMetrics) => void;
  getSlowRenders: () => PerformanceMetrics[];
  clearSlowRenders: () => void;
  isMonitoringEnabled: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
  enabled?: boolean;
  maxSlowRenders?: number;
}

export function PerformanceProvider({
  children,
  enabled = process.env.NODE_ENV === 'development',
  maxSlowRenders = 100,
}: PerformanceProviderProps) {
  const slowRenders = useRef<PerformanceMetrics[]>([]);

  const reportSlowRender = useCallback((metrics: PerformanceMetrics) => {
    if (!enabled) return;

    slowRenders.current.push(metrics);

    // Manter apenas os últimos N renders lentos
    if (slowRenders.current.length > maxSlowRenders) {
      slowRenders.current = slowRenders.current.slice(-maxSlowRenders);
    }

    // Log no console para debugging
    console.warn(
      `🐌 Slow render detected in ${metrics.componentName}: ${metrics.renderTime.toFixed(2)}ms`
    );
  }, [enabled, maxSlowRenders]);

  const getSlowRenders = useCallback(() => {
    return [...slowRenders.current];
  }, []);

  const clearSlowRenders = useCallback(() => {
    slowRenders.current = [];
  }, []);

  const value: PerformanceContextType = {
    reportSlowRender,
    getSlowRenders,
    clearSlowRenders,
    isMonitoringEnabled: enabled,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  
  return context;
}

// Hook para usar o performance monitor com o contexto global
export function useGlobalPerformanceMonitor(componentName: string) {
  const { reportSlowRender, isMonitoringEnabled } = usePerformanceContext();
  
  return {
    reportSlowRender,
    isMonitoringEnabled,
    componentName,
  };
}