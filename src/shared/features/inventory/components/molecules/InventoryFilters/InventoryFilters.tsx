import React from 'react';
import { Search, Filter, AlertTriangle, Package } from 'lucide-react';
import { InventoryFilters as IInventoryFilters, MaterialCategory } from '../../../types';

interface InventoryFiltersProps {
  filters: IInventoryFilters;
  categories: MaterialCategory[];
  onFiltersChange: (filters: IInventoryFilters) => void;
  className?: string;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  className = ''
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ 
      ...filters, 
      categoryId: categoryId === 'all' ? undefined : categoryId 
    });
  };

  const handleFilterToggle = (filterKey: 'lowStock' | 'outOfStock') => {
    onFiltersChange({
      ...filters,
      [filterKey]: !filters[filterKey]
    });
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">Filtros</h3>
      </div>

      <div className="space-y-4">
        {/* Busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar material
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nome, marca ou categoria..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={filters.categoryId || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros de estoque */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status do estoque
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.lowStock || false}
                onChange={() => handleFilterToggle('lowStock')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Estoque baixo
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.outOfStock || false}
                onChange={() => handleFilterToggle('outOfStock')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                <Package className="w-4 h-4 text-red-500" />
                Sem estoque
              </span>
            </label>
          </div>
        </div>

        {/* Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.sortBy || 'name'}
              onChange={(e) => handleSortChange(e.target.value, filters.sortOrder || 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Nome</option>
              <option value="stock">Estoque</option>
              <option value="cost">Custo</option>
              <option value="updated">Atualização</option>
            </select>
            
            <select
              value={filters.sortOrder || 'asc'}
              onChange={(e) => handleSortChange(filters.sortBy || 'name', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>

        {/* Limpar filtros */}
        {(filters.search || filters.categoryId || filters.lowStock || filters.outOfStock) && (
          <button
            onClick={() => onFiltersChange({})}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
};