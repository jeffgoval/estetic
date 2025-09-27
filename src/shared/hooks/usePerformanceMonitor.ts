import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  threshold?: number; // Threshold em ms para considerar render lento
  onSlowRender?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
  threshold = 16, // 16ms = 60fps
  onSlowRender,
}: UsePerformanceMonitorOptions) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const totalRenderTime = useRef<number>(0);

  // Marcar início do render
  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  // Marcar fim do render e calcular métricas
  const endRender = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;
    totalRenderTime.current += renderTime;

    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    };

    // Log métricas no console (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const avgRenderTime = totalRenderTime.current / renderCount.current;
      
      console.group(`🔍 Performance: ${componentName}`);
      console.log(`Render time: ${renderTime.toFixed(2)}ms`);
      console.log(`Average render time: ${avgRenderTime.toFixed(2)}ms`);
      console.log(`Total renders: ${renderCount.current}`);
      
      if (renderTime > threshold) {
        console.warn(`⚠️ Slow render detected! (${renderTime.toFixed(2)}ms > ${threshold}ms)`);
      }
      
      console.groupEnd();
    }

    // Callback para renders lentos
    if (renderTime > threshold && onSlowRender) {
      onSlowRender(metrics);
    }

    renderStartTime.current = 0;
  }, [enabled, componentName, threshold, onSlowRender]);

  // Usar useEffect para medir renders
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  // Função para obter estatísticas
  const getStats = useCallback(() => {
    return {
      renderCount: renderCount.current,
      totalRenderTime: totalRenderTime.current,
      averageRenderTime: renderCount.current > 0 
        ? totalRenderTime.current / renderCount.current 
        : 0,
    };
  }, []);

  // Função para resetar estatísticas
  const resetStats = useCallback(() => {
    renderCount.current = 0;
    totalRenderTime.current = 0;
  }, []);

  return {
    getStats,
    resetStats,
  };
}