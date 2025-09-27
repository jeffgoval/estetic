import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface WaitingListFiltersProps {
  filters: {
    status: string;
    priority: string;
    professionalId: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  professionals: Array<{ id: number; name: string }>;
  className?: string;
}

const WaitingListFilters: React.FC<WaitingListFiltersProps> = ({
  filters,
  onFiltersChange,
  professionals,
  className = '',
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      priority: '',
      professionalId: '',
      search: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Busca */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome do paciente..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status */}
        <div className="min-w-40">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="waiting">Aguardando</option>
            <option value="contacted">Contatado</option>
            <option value="scheduled">Agendado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Prioridade */}
        <div className="min-w-40">
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="5">Urgente</option>
            <option value="4">Alta</option>
            <option value="3">Média</option>
            <option value="2">Baixa</option>
            <option value="1">Muito Baixa</option>
          </select>
        </div>

        {/* Profissional */}
        <div className="min-w-48">
          <select
            value={filters.professionalId}
            onChange={(e) => handleFilterChange('professionalId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os profissionais</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id.toString()}>
                {professional.name}
              </option>
            ))}
          </select>
        </div>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Filtros ativos:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {filters.status && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Status: {filters.status}
                </span>
              )}
              {filters.priority && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Prioridade: {filters.priority}
                </span>
              )}
              {filters.professionalId && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  Profissional selecionado
                </span>
              )}
              {filters.search && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Busca: "{filters.search}"
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingListFilters;