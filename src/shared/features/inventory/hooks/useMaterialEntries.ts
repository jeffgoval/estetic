import { useState, useEffect } from 'react';
import { MaterialEntry, MaterialEntryFormData } from '../types';

// Hook para gerenciar entradas e saídas de materiais
export const useMaterialEntries = (materialId?: string) => {
  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular dados para desenvolvimento - será substituído por GraphQL
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        
        // Dados simulados
        const mockEntries: MaterialEntry[] = [
          {
            id: '1',
            tenantId: 'tenant-1',
            materialId: '1',
            entryType: 'in',
            quantity: 10,
            unitCost: 850.00,
            totalCost: 8500.00,
            expiryDate: '2025-12-31',
            batchNumber: 'BT2024001',
            supplierName: 'Distribuidora Médica',
            invoiceNumber: 'NF-001234',
            notes: 'Compra mensal de botox',
            createdBy: 'user-1',
            createdAt: '2024-01-15T10:00:00Z',
            material: {
              id: '1',
              tenantId: 'tenant-1',
              name: 'Botox Allergan 100U',
              brand: 'Allergan',
              unitType: 'frasco',
              minStockLevel: 5,
              maxStockLevel: 20,
              currentStock: 3,
              unitCost: 850.00,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z'
            }
          },
          {
            id: '2',
            tenantId: 'tenant-1',
            materialId: '1',
            entryType: 'out',
            quantity: 7,
            unitCost: 850.00,
            totalCost: 5950.00,
            notes: 'Consumo em procedimentos',
            createdBy: 'user-2',
            createdAt: '2024-01-20T14:30:00Z',
            material: {
              id: '1',
              tenantId: 'tenant-1',
              name: 'Botox Allergan 100U',
              brand: 'Allergan',
              unitType: 'frasco',
              minStockLevel: 5,
              maxStockLevel: 20,
              currentStock: 3,
              unitCost: 850.00,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z'
            }
          }
        ];

        // Filtrar por material se especificado
        let filteredEntries = mockEntries;
        if (materialId) {
          filteredEntries = mockEntries.filter(entry => entry.materialId === materialId);
        }

        // Ordenar por data mais recente
        filteredEntries.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setEntries(filteredEntries);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar movimentações');
        console.error('Erro ao buscar entradas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [materialId]);

  const createEntry = async (entryData: MaterialEntryFormData) => {
    try {
      // Calcular custo total
      const totalCost = entryData.quantity * entryData.unitCost;

      // Simular criação - será substituído por GraphQL mutation
      const newEntry: MaterialEntry = {
        ...entryData,
        id: Date.now().toString(),
        tenantId: 'tenant-1',
        totalCost,
        createdBy: 'current-user',
        createdAt: new Date().toISOString()
      };

      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError('Erro ao registrar movimentação');
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<MaterialEntry>) => {
    try {
      // Recalcular custo total se necessário
      const updatedData = { ...updates };
      if (updates.quantity !== undefined || updates.unitCost !== undefined) {
        const entry = entries.find(e => e.id === id);
        if (entry) {
          const quantity = updates.quantity ?? entry.quantity;
          const unitCost = updates.unitCost ?? entry.unitCost;
          updatedData.totalCost = quantity * unitCost;
        }
      }

      // Simular atualização - será substituído por GraphQL mutation
      setEntries(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, ...updatedData } : entry
        )
      );
    } catch (err) {
      setError('Erro ao atualizar movimentação');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      // Simular exclusão - será substituído por GraphQL mutation
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError('Erro ao excluir movimentação');
      throw err;
    }
  };

  // Calcular totais
  const totals = entries.reduce(
    (acc, entry) => {
      if (entry.entryType === 'in') {
        acc.totalIn += entry.quantity;
        acc.totalCostIn += entry.totalCost;
      } else {
        acc.totalOut += entry.quantity;
        acc.totalCostOut += entry.totalCost;
      }
      return acc;
    },
    { totalIn: 0, totalOut: 0, totalCostIn: 0, totalCostOut: 0 }
  );

  return {
    entries,
    loading,
    error,
    totals,
    createEntry,
    updateEntry,
    deleteEntry
  };
};