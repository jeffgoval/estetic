import { useState, useEffect, useMemo, useCallback } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Número de itens extras para renderizar fora da viewport
  scrollingDelay?: number; // Delay para detectar fim do scroll
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollingDelay = 150,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calcular índices visíveis
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Aplicar overscan
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Itens visíveis
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  // Altura total da lista
  const totalHeight = items.length * itemHeight;

  // Offset do primeiro item visível
  const offsetY = visibleRange.start * itemHeight;

  // Handler para scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
  }, []);

  // Detectar fim do scroll
  useEffect(() => {
    if (!isScrolling) return;

    const timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);

    return () => clearTimeout(timeoutId);
  }, [scrollTop, scrollingDelay, isScrolling]);

  // Função para scroll para um índice específico
  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  // Função para scroll para o topo
  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  // Função para scroll para o fim
  const scrollToBottom = useCallback(() => {
    const maxScrollTop = Math.max(0, totalHeight - containerHeight);
    setScrollTop(maxScrollTop);
  }, [totalHeight, containerHeight]);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    isScrolling,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    // Propriedades úteis para debugging
    visibleRange,
    scrollTop,
  };
}