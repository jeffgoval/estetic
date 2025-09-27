import React, { useState, useEffect } from 'react';
import { X, Save, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Material, MaterialEntryFormData } from '../../../types';

interface MaterialEntryFormProps {
  materials: Material[];
  selectedMaterial?: Material;
  onSubmit: (data: MaterialEntryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export const MaterialEntryForm: React.FC<MaterialEntryFormProps> = ({
  materials,
  selectedMaterial,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<MaterialEntryFormData>({
    materialId: '',
    entryType: 'in',
    quantity: 1,
    unitCost: 0,
    expiryDate: '',
    batchNumber: '',
    supplierName: '',
    invoiceNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<MaterialEntryFormData>>({});

  // Preencher material selecionado
  useEffect(() => {
    if (selectedMaterial) {
      setFormData(prev => ({
        ...prev,
        materialId: selectedMaterial.id,
        unitCost: selectedMaterial.unitCost,
        supplierName: selectedMaterial.supplierName || ''
      }));
    }
  }, [selectedMaterial]);

  // Atualizar custo unitário quando material mudar
  useEffect(() => {
    if (formData.materialId) {
      const material = materials.find(m => m.id === formData.materialId);
      if (material && formData.unitCost === 0) {
        setFormData(prev => ({
          ...prev,
          unitCost: material.unitCost,
          supplierName: material.supplierName || ''
        }));
      }
    }
  }, [formData.materialId, materials]);

  const validateForm = (): boolean => {
    const newErrors: Partial<MaterialEntryFormData> = {};

    if (!formData.materialId) {
      newErrors.materialId = 'Material é obrigatório';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    if (formData.unitCost < 0) {
      newErrors.unitCost = 'Custo unitário não pode ser negativo';
    }

    // Validar se há estoque suficiente para saída
    if (formData.entryType === 'out' && formData.materialId) {
      const material = materials.find(m => m.id === formData.materialId);
      if (material && formData.quantity > material.currentStock) {
        newErrors.quantity = `Estoque insuficiente. Disponível: ${material.currentStock}`;
      }
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
      console.error('Erro ao registrar movimentação:', error);
    }
  };

  const handleInputChange = (field: keyof MaterialEntryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedMaterialData = materials.find(m => m.id === formData.materialId);
  const totalCost = formData.quantity * formData.unitCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            formData.entryType === 'in' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {formData.entryType === 'in' ? (
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {formData.entryType === 'in' ? 'Entrada de Material' : 'Saída de Material'}
            </h2>
            <p className="text-sm text-gray-500">
              {formData.entryType === 'in' 
                ? 'Registre a entrada de materiais no estoque'
                : 'Registre o consumo ou saída de materiais'
              }
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
        {/* Tipo de movimentação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Movimentação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('entryType', 'in')}
              className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                formData.entryType === 'in'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowUpCircle className="w-5 h-5" />
              Entrada
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('entryType', 'out')}
              className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                formData.entryType === 'out'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowDownCircle className="w-5 h-5" />
              Saída
            </button>
          </div>
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material *
          </label>
          <select
            value={formData.materialId}
            onChange={(e) => handleInputChange('materialId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.materialId ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={!!selectedMaterial}
          >
            <option value="">Selecione um material</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name} - Estoque: {material.currentStock} {material.unitType}
              </option>
            ))}
          </select>
          {errors.materialId && (
            <p className="mt-1 text-sm text-red-600">{errors.materialId}</p>
          )}
          
          {selectedMaterialData && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Estoque atual:</span>
                <span className="font-medium text-blue-900">
                  {selectedMaterialData.currentStock} {selectedMaterialData.unitType}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quantidade e Custo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

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
            />
            {errors.unitCost && (
              <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>
            )}
          </div>
        </div>

        {/* Custo total */}
        {totalCost > 0 && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Custo Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        )}

        {/* Campos específicos para entrada */}
        {formData.entryType === 'in' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Validade
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Lote
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: BT2024001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Nota Fiscal
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: NF-001234"
                />
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações adicionais sobre a movimentação..."
          />
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
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              formData.entryType === 'in'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Registrar {formData.entryType === 'in' ? 'Entrada' : 'Saída'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};