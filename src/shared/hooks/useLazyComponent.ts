import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { useLoadingState } from './useLoadingState';

interface LazyComponentOptions {
  fallback?: ComponentType;
  preload?: boolean;
  delay?: number;
}

export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) {
  const { setLoading, isLoading } = useLoadingState();
  const { preload = false, delay = 0 } = options;

  // Criar componente lazy
  const LazyComponent: LazyExoticComponent<T> = lazy(async () => {
    const componentKey = importFn.toString();
    
    try {
      setLoading(componentKey, true);
      
      // Adicionar delay se especificado (útil para evitar flicker)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const module = await importFn();
      return module;
    } finally {
      setLoading(componentKey, false);
    }
  });

  // Preload se solicitado
  if (preload) {
    importFn().catch(console.error);
  }

  return {
    Component: LazyComponent,
    isLoading: isLoading(importFn.toString()),
  };
}