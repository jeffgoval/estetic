import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { Material, MaterialFormData, MaterialCategory } from '../../../types';

interface MaterialFormProps {
  material?: Material;
  categories: MaterialCategory[];
  onSubmit: (data: MaterialFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
  material,
  categories,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    categoryId: '',
    brand: '',
    description: '',
    unitType: 'unidade',
    minStockLevel: 0,
    maxStockLevel: 100,
    currentStock: 0,
    unitCost: 0,
    supplierName: '',
    supplierContact: ''
  });

  const [errors, setErrors] = useState<Partial<MaterialFormData>>({});

  // Preencher formulário se editando
  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        categoryId: material.categoryId || '',
        brand: material.brand || '',
        description: material.description || '',
        unitType: material.unitType,
        minStockLevel: material.minStockLevel,
        maxStockLevel: material.maxStockLevel,
        currentStock: material.currentStock,
        unitCost: material.unitCost,
        supplierName: material.supplierName || '',
        supplierContact: material.supplierContact || ''
      });
    }
  }, [material]);

  const validateForm = (): boolean => {
    const newErrors: Partial<MaterialFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.unitType.trim()) {
      newErrors.unitType = 'Tipo de unidade é obrigatório';
    }

    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = 'Estoque mínimo não pode ser negativo';
    }

    if (formData.maxStockLevel < formData.minStockLevel) {
      newErrors.maxStockLevel = 'Estoque máximo deve ser maior que o mínimo';
    }

    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Estoque atual não pode ser negativo';
    }

    if (formData.unitCost < 0) {
      newErrors.unitCost = 'Custo unitário não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar material:', error);
    }
  };

  const handleInputChange = (field: keyof MaterialFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {material ? 'Editar Material' : 'Novo Material'}
            </h2>
            <p className="text-sm text-gray-500">
              {material ? 'Atualize as informações do material' : 'Cadastre um novo material no estoque'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Material *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Botox Allergan 100U"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Allergan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Unidade *
            </label>
            <input
              type="text"
              value={formData.unitType}
              onChange={(e) => handleInputChange('unitType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.unitType ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: frasco, seringa, unidade"
            />
            {errors.unitType && (
              <p className="mt-1 text-sm text-red-600">{errors.unitType}</p>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descrição detalhada do material..."
          />
        </div>

        {/* Controle de estoque */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Controle de Estoque</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.minStockLevel ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.minStockLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.minStockLevel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Máximo
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxStockLevel}
                onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.maxStockLevel ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.maxStockLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.maxStockLevel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Atual
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.currentStock ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.currentStock && (
                <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>
              )}
            </div>
          </div>
        </div>

        {/* Custo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custo Unitário (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.unitCost}
            onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.unitCost ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0,00"
          />
          {errors.unitCost && (
            <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>
          )}
        </div>

        {/* Fornecedor */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Fornecedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Fornecedor
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Distribuidora Médica"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contato do Fornecedor
              </label>
              <input
                type="text"
                value={formData.supplierContact}
                onChange={(e) => handleInputChange('supplierContact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {material ? 'Atualizar' : 'Salvar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};