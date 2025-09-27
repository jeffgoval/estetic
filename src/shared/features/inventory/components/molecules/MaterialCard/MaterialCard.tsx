import React from 'react';
import { Package, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { Material } from '../../../types';
import { StockBadge } from '../../atoms/StockBadge';

interface MaterialCardProps {
  material: Material;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onAddStock?: (material: Material) => void;
  onRemoveStock?: (material: Material) => void;
  className?: string;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onEdit,
  onDelete,
  onAddStock,
  onRemoveStock,
  className = ''
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalValue = material.currentStock * material.unitCost;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{material.name}</h3>
            {material.brand && (
              <p className="text-sm text-gray-500">{material.brand}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {onAddStock && (
            <button
              onClick={() => onAddStock(material)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Adicionar estoque"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {onRemoveStock && (
            <button
              onClick={() => onRemoveStock(material)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remover estoque"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(material)}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              title="Editar material"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(material)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Excluir material"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categoria */}
      {material.category && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
            {material.category.name}
          </span>
        </div>
      )}

      {/* Estoque */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Estoque</span>
          <StockBadge
            currentStock={material.currentStock}
            minStockLevel={material.minStockLevel}
            maxStockLevel={material.maxStockLevel}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Atual: {material.currentStock} {material.unitType}</span>
          <span>Min: {material.minStockLevel} | Max: {material.maxStockLevel}</span>
        </div>
      </div>

      {/* Valores */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Custo unitário:</span>
          <span className="font-medium">{formatCurrency(material.unitCost)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Valor total:</span>
          <span className="font-semibold text-blue-600">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {/* Fornecedor */}
      {material.supplierName && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Fornecedor:</span> {material.supplierName}
          </div>
          {material.supplierContact && (
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-medium">Contato:</span> {material.supplierContact}
            </div>
          )}
        </div>
      )}
    </div>
  );
};