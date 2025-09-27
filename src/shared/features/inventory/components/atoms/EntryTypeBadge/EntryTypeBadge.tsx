import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface EntryTypeBadgeProps {
  type: 'in' | 'out';
  className?: string;
}

export const EntryTypeBadge: React.FC<EntryTypeBadgeProps> = ({
  type,
  className = ''
}) => {
  const config = {
    in: {
      label: 'Entrada',
      icon: ArrowUpCircle,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    out: {
      label: 'Saída',
      icon: ArrowDownCircle,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const { label, icon: Icon, color } = config[type];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};