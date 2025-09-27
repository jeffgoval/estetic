import React, { useState } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { Material, InventoryFilters, MaterialCategory } from '../../../types';
import { MaterialCard } from '../../molecules/MaterialCard';
import { InventoryFilters as FiltersComponent } from '../../molecules/InventoryFilters';

interface MaterialListProps {
  materials: Material[];
  categories: MaterialCategory[];
  loading?: boolean;
  onCreateMaterial?: () => void;
  onEditMaterial?: (material: Material) => void;
  onDeleteMaterial?: (material: Material) => void;
  onAddStock?: (material: Material) => void;
  onRemoveStock?: (material: Material) => void;
  className?: string;
}

export const MaterialList: React.FC<MaterialListProps> = ({
  materials,
  categories,
  loading = false,
  onCreateMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onAddStock,
  onRemoveStock,
  className = ''
}) => {
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros aos materiais
  const filteredMaterials = materials.filter(material => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        material.name.toLowerCase().includes(searchLower) ||
        material.brand?.toLowerCase().includes(searchLower) ||
        material.category?.name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    if (filters.categoryId && material.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.lowStock && material.currentStock > material.minStockLevel) {
      return false;
    }

    if (filters.outOfStock && material.currentStock > 0) {
      return false;
    }

    return true;
  });

  // Ordenar materiais
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'stock':
        aValue = a.currentStock;
        bValue = b.currentStock;
        break;
      case 'cost':
        aValue = a.unitCost;
        bValue = b.unitCost;
        break;
      case 'updated':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        return 0;
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });

  // Estatísticas
  const stats = {
    total: materials.length,
    lowStock: materials.filter(m => m.currentStock <= m.minStockLevel && m.currentStock > 0).length,
    outOfStock: materials.filter(m => m.currentStock === 0).length,
    totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0)
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Materials skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Gestão de Estoque</h1>
              <p className="text-sm text-gray-500">Controle de materiais e suprimentos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            
            {onCreateMaterial && (
              <button
                onClick={onCreateMaterial}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
                Novo Material
              </button>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Materiais</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
              </div>
              <Package className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <FiltersComponent
          filters={filters}
          categories={categories}
          onFiltersChange={setFilters}
        />
      )}

      {/* Lista de materiais */}
      {sortedMaterials.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {materials.length === 0 ? 'Nenhum material cadastrado' : 'Nenhum material encontrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {materials.length === 0 
              ? 'Comece cadastrando seu primeiro material no estoque.'
              : 'Tente ajustar os filtros para encontrar o que procura.'
            }
          </p>
          {materials.length === 0 && onCreateMaterial && (
            <button
              onClick={onCreateMaterial}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeiro Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={onEditMaterial}
              onDelete={onDeleteMaterial}
              onAddStock={onAddStock}
              onRemoveStock={onRemoveStock}
            />
          ))}
        </div>
      )}

      {/* Resultados */}
      {sortedMaterials.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {sortedMaterials.length} de {materials.length} materiais
        </div>
      )}
    </div>
  );
};