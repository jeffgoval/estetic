import { useState, useEffect } from 'react';
import { MaterialCategory, CategoryFormData } from '../types';

// Hook para gerenciar categorias de materiais
export const useCategories = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular dados para desenvolvimento - será substituído por GraphQL
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Dados simulados
        const mockCategories: MaterialCategory[] = [
          {
            id: 'cat-1',
            tenantId: 'tenant-1',
            name: 'Injetáveis',
            description: 'Produtos injetáveis como botox e preenchedores',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'cat-2',
            tenantId: 'tenant-1',
            name: 'Preenchedores',
            description: 'Ácido hialurônico e outros preenchedores',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'cat-3',
            tenantId: 'tenant-1',
            name: 'Descartáveis',
            description: 'Materiais descartáveis e consumíveis',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'cat-4',
            tenantId: 'tenant-1',
            name: 'Equipamentos',
            description: 'Equipamentos e instrumentos',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setCategories(mockCategories);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar categorias');
        console.error('Erro ao buscar categorias:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const createCategory = async (categoryData: CategoryFormData) => {
    try {
      // Simular criação - será substituído por GraphQL mutation
      const newCategory: MaterialCategory = {
        ...categoryData,
        id: Date.now().toString(),
        tenantId: 'tenant-1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError('Erro ao criar categoria');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<MaterialCategory>) => {
    try {
      // Simular atualização - será substituído por GraphQL mutation
      setCategories(prev =>
        prev.map(category =>
          category.id === id
            ? { ...category, ...updates, updatedAt: new Date().toISOString() }
            : category
        )
      );
    } catch (err) {
      setError('Erro ao atualizar categoria');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Simular exclusão - será substituído por GraphQL mutation
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      setError('Erro ao excluir categoria');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
};