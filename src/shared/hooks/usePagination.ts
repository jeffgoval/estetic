import { useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

interface UsePaginationReturn {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  visibleRange: {
    start: number;
    end: number;
  };
}

export function usePagination({
  totalItems,
  itemsPerPage,
  currentPage,
}: UsePaginationProps): UsePaginationReturn {
  return useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    
    const visibleRange = {
      start: totalItems === 0 ? 0 : startIndex + 1,
      end: endIndex,
    };

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
      isFirstPage,
      isLastPage,
      visibleRange,
    };
  }, [totalItems, itemsPerPage, currentPage]);
}