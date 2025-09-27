import { useState, useEffect } from 'react';
import { Material, InventoryFilters, StockAlert } from '../types';

// Hook para gerenciar materiais
export const useMaterials = (filters?: InventoryFilters) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular dados para desenvolvimento - será substituído por GraphQL
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        
        // Dados simulados
        const mockMaterials: Material[] = [
          {
            id: '1',
            tenantId: 'tenant-1',
            categoryId: 'cat-1',
            name: 'Botox Allergan 100U',
            brand: 'Allergan',
            description: 'Toxina botulínica tipo A',
            unitType: 'frasco',
            minStockLevel: 5,
            maxStockLevel: 20,
            currentStock: 3,
            unitCost: 850.00,
            supplierName: 'Distribuidora Médica',
            supplierContact: '(11) 99999-9999',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: {
              id: 'cat-1',
              tenantId: 'tenant-1',
              name: 'Injetáveis',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          {
            id: '2',
            tenantId: 'tenant-1',
            categoryId: 'cat-2',
            name: 'Ácido Hialurônico 2ml',
            brand: 'Juvederm',
            description: 'Preenchedor facial',
            unitType: 'seringa',
            minStockLevel: 10,
            maxStockLevel: 30,
            currentStock: 15,
            unitCost: 450.00,
            supplierName: 'Estética Supply',
            supplierContact: '(11) 88888-8888',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: {
              id: 'cat-2',
              tenantId: 'tenant-1',
              name: 'Preenchedores',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ];

        // Aplicar filtros
        let filteredMaterials = mockMaterials;
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredMaterials = filteredMaterials.filter(material =>
            material.name.toLowerCase().includes(searchLower) ||
            material.brand?.toLowerCase().includes(searchLower) ||
            material.category?.name.toLowerCase().includes(searchLower)
          );
        }

        if (filters?.categoryId) {
          filteredMaterials = filteredMaterials.filter(
            material => material.categoryId === filters.categoryId
          );
        }

        if (filters?.lowStock) {
          filteredMaterials = filteredMaterials.filter(
            material => material.currentStock <= material.minStockLevel
          );
        }

        if (filters?.outOfStock) {
          filteredMaterials = filteredMaterials.filter(
            material => material.currentStock === 0
          );
        }

        // Ordenação
        if (filters?.sortBy) {
          filteredMaterials.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
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

            if (filters.sortOrder === 'desc') {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          });
        }

        setMaterials(filteredMaterials);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar materiais');
        console.error('Erro ao buscar materiais:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [filters]);

  const createMaterial = async (materialData: Omit<Material, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Simular criação - será substituído por GraphQL mutation
      const newMaterial: Material = {
        ...materialData,
        id: Date.now().toString(),
        tenantId: 'tenant-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMaterials(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err) {
      setError('Erro ao criar material');
      throw err;
    }
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      // Simular atualização - será substituído por GraphQL mutation
      setMaterials(prev =>
        prev.map(material =>
          material.id === id
            ? { ...material, ...updates, updatedAt: new Date().toISOString() }
            : material
        )
      );
    } catch (err) {
      setError('Erro ao atualizar material');
      throw err;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      // Simular exclusão - será substituído por GraphQL mutation
      setMaterials(prev => prev.filter(material => material.id !== id));
    } catch (err) {
      setError('Erro ao excluir material');
      throw err;
    }
  };

  return {
    materials,
    loading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial
  };
};

// Hook para alertas de estoque
export const useStockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        // Simular alertas baseados nos materiais
        const mockAlerts: StockAlert[] = [
          {
            materialId: '1',
            materialName: 'Botox Allergan 100U',
            currentStock: 3,
            minStockLevel: 5,
            alertType: 'low_stock',
            severity: 'warning'
          }
        ];

        setAlerts(mockAlerts);
      } catch (err) {
        console.error('Erro ao buscar alertas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return { alerts, loading };
};