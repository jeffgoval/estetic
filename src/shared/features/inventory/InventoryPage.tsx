import React, { useState } from 'react';
import { Plus, Settings, BarChart3, FileText } from 'lucide-react';
import { useMaterials, useStockAlerts } from './hooks/useMaterials';
import { useCategories } from './hooks/useCategories';
import { useMaterialEntries } from './hooks/useMaterialEntries';
import { MaterialList } from './components/organisms/MaterialList';
import { MaterialForm } from './components/organisms/MaterialForm';
import { CategoryManager } from './components/organisms/CategoryManager';
import { MaterialEntryForm } from './components/organisms/MaterialEntryForm';
import { MaterialEntryList } from './components/organisms/MaterialEntryList';
import { StockAlerts } from './components/organisms/StockAlerts';
import { Material, MaterialFormData, MaterialEntryFormData, CategoryFormData } from './types';

type ViewMode = 'list' | 'create' | 'edit' | 'categories' | 'entries' | 'alerts' | 'reports';

export const InventoryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Hooks
  const { materials, loading: materialsLoading, createMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { entries, loading: entriesLoading, createEntry } = useMaterialEntries();
  const { alerts, loading: alertsLoading } = useStockAlerts();

  // Handlers para materiais
  const handleCreateMaterial = () => {
    setSelectedMaterial(null);
    setViewMode('create');
  };

  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setViewMode('edit');
  };

  const handleDeleteMaterial = async (material: Material) => {
    if (window.confirm(`Tem certeza que deseja excluir o material "${material.name}"?`)) {
      try {
        await deleteMaterial(material.id);
      } catch (error) {
        console.error('Erro ao excluir material:', error);
      }
    }
  };

  const handleSubmitMaterial = async (data: MaterialFormData) => {
    try {
      if (selectedMaterial) {
        await updateMaterial(selectedMaterial.id, data);
      } else {
        await createMaterial(data);
      }
      setViewMode('list');
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      throw error;
    }
  };

  // Handlers para movimentações
  const handleAddStock = (material: Material) => {
    setSelectedMaterial(material);
    setViewMode('entries');
  };

  const handleRemoveStock = (material: Material) => {
    setSelectedMaterial(material);
    setViewMode('entries');
  };

  const handleSubmitEntry = async (data: MaterialEntryFormData) => {
    try {
      await createEntry(data);
      setViewMode('list');
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      throw error;
    }
  };

  // Handlers para categorias
  const handleSubmitCategory = async (data: CategoryFormData) => {
    try {
      await createCategory(data);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  };

  const handleUpdateCategory = async (id: string, data: Partial<CategoryFormData>) => {
    try {
      await updateCategory(id, data);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedMaterial(null);
  };

  // Renderizar conteúdo baseado no modo de visualização
  const renderContent = () => {
    switch (viewMode) {
      case 'create':
      case 'edit':
        return (
          <MaterialForm
            material={selectedMaterial || undefined}
            categories={categories}
            onSubmit={handleSubmitMaterial}
            onCancel={handleCancel}
            loading={false}
          />
        );

      case 'categories':
        return (
          <CategoryManager
            categories={categories}
            onCreateCategory={handleSubmitCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            loading={categoriesLoading}
          />
        );

      case 'entries':
        return (
          <div className="space-y-6">
            <MaterialEntryForm
              materials={materials}
              selectedMaterial={selectedMaterial || undefined}
              onSubmit={handleSubmitEntry}
              onCancel={handleCancel}
              loading={false}
            />
            
            <MaterialEntryList
              entries={entries}
              loading={entriesLoading}
              showMaterial={!selectedMaterial}
            />
          </div>
        );

      case 'alerts':
        return (
          <StockAlerts
            alerts={alerts}
            loading={alertsLoading}
          />
        );

      case 'reports':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Relatórios em Desenvolvimento
            </h3>
            <p className="text-gray-500">
              Os relatórios de estoque estarão disponíveis em breve.
            </p>
          </div>
        );

      default:
        return (
          <MaterialList
            materials={materials}
            categories={categories}
            loading={materialsLoading}
            onCreateMaterial={handleCreateMaterial}
            onEditMaterial={handleEditMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onAddStock={handleAddStock}
            onRemoveStock={handleRemoveStock}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        {viewMode !== 'list' && (
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setViewMode('list')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Estoque
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">
                {viewMode === 'create' && 'Novo Material'}
                {viewMode === 'edit' && 'Editar Material'}
                {viewMode === 'categories' && 'Categorias'}
                {viewMode === 'entries' && 'Movimentações'}
                {viewMode === 'alerts' && 'Alertas'}
                {viewMode === 'reports' && 'Relatórios'}
              </span>
            </nav>
          </div>
        )}

        {/* Quick Actions */}
        {viewMode === 'list' && (
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Ações Rápidas</h2>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('alerts')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="flex items-center gap-1">
                      Alertas
                      {alerts.length > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {alerts.length}
                        </span>
                      )}
                    </span>
                  </button>

                  <button
                    onClick={() => setViewMode('entries')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FileText className="w-4 h-4" />
                    Movimentações
                  </button>

                  <button
                    onClick={() => setViewMode('categories')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Settings className="w-4 h-4" />
                    Categorias
                  </button>

                  <button
                    onClick={() => setViewMode('reports')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Relatórios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};