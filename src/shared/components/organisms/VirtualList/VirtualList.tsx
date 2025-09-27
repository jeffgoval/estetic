import { ReactNode, CSSProperties } from 'react';
import { useVirtualScroll } from '@/shared/hooks/useVirtualScroll';
import { cn } from '@/shared/utils/cn';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
}

export default function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  emptyMessage = 'Nenhum item encontrado',
  loadingMessage = 'Carregando...',
  isLoading = false,
}: VirtualListProps<T>) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    isScrolling,
  } = useVirtualScroll(items, {
    itemHeight,
    containerHeight: height,
    overscan,
  });

  const handleScrollEvent = (event: React.UIEvent<HTMLDivElement>) => {
    handleScroll(event);
    onScroll?.(event.currentTarget.scrollTop);
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-white border border-gray-200 rounded-lg',
          className
        )}
        style={{ height }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // Mostrar mensagem vazia
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-white border border-gray-200 rounded-lg',
          className
        )}
        style={{ height }}
      >
        <span className="text-sm text-gray-500">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-auto bg-white border border-gray-200 rounded-lg',
        className
      )}
      style={{ height }}
      onScroll={handleScrollEvent}
    >
      {/* Container total com altura calculada */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container dos itens visíveis */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                position: 'relative',
              }}
              className={cn(
                'border-b border-gray-100 last:border-b-0',
                isScrolling && 'pointer-events-none' // Desabilitar eventos durante scroll
              )}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de scroll ativo */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Rolando...
        </div>
      )}
    </div>
  );
}