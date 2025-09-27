import React from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Ajustar se não temos páginas suficientes de um lado
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // Adicionar primeira página e ellipsis se necessário
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Adicionar páginas visíveis
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Adicionar ellipsis e última página se necessário
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn('flex items-center justify-center space-x-1', className)}>
      {/* Botão Primeira Página */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2"
        >
          <Icon name="ChevronsLeft" size="sm" />
        </Button>
      )}
      
      {/* Botão Página Anterior */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2"
      >
        <Icon name="ChevronLeft" size="sm" />
      </Button>
      
      {/* Números das Páginas */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-1 text-neutral-500">...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="min-w-[32px]"
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}
      
      {/* Botão Próxima Página */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2"
      >
        <Icon name="ChevronRight" size="sm" />
      </Button>
      
      {/* Botão Última Página */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2"
        >
          <Icon name="ChevronsRight" size="sm" />
        </Button>
      )}
    </div>
  );
};