import React from 'react';

interface StockBadgeProps {
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  currentStock,
  minStockLevel,
  maxStockLevel,
  className = ''
}) => {
  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        label: 'Sem estoque',
        color: 'bg-red-100 text-red-800 border-red-200',
        severity: 'critical' as const
      };
    }
    
    if (currentStock <= minStockLevel) {
      return {
        label: 'Estoque baixo',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        severity: 'warning' as const
      };
    }
    
    if (currentStock >= maxStockLevel) {
      return {
        label: 'Estoque alto',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        severity: 'info' as const
      };
    }
    
    return {
      label: 'Estoque normal',
      color: 'bg-green-100 text-green-800 border-green-200',
      severity: 'normal' as const
    };
  };

  const status = getStockStatus();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color} ${className}`}
      title={`Estoque atual: ${currentStock} | Mínimo: ${minStockLevel} | Máximo: ${maxStockLevel}`}
    >
      {status.label}
    </span>
  );
};