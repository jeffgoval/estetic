import React from 'react';

interface PriorityBadgeProps {
  priority: number;
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityConfig = (priority: number) => {
    switch (priority) {
      case 5:
        return {
          label: 'Urgente',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: '🔴'
        };
      case 4:
        return {
          label: 'Alta',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🟠'
        };
      case 3:
        return {
          label: 'Média',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡'
        };
      case 2:
        return {
          label: 'Baixa',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '🔵'
        };
      case 1:
      default:
        return {
          label: 'Muito Baixa',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚪'
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className} ${className}`}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default PriorityBadge;