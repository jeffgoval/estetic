import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Material {
  id: string;
  tenantId: string;
  categoryId?: string;
  name: string;
  brand?: string;
  description?: string;
  unitType: string;
  minStockLevel: number;
  maxStockLevel: number;
  currentStock: number;
  unitCost: number;
  supplierName?: string;
  supplierContact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MaterialCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MaterialEntry {
  id: string;
  tenantId: string;
  materialId: string;
  entryType: 'in' | 'out';
  quantity: number;
  unitCost: number;
  totalCost: number;
  expiryDate?: string;
  batchNumber?: string;
  supplierName?: string;
  invoiceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

interface MaterialsState {
  // Estado
  materials: Material[];
  categories: MaterialCategory[];
  entries: MaterialEntry[];
  selectedMaterial: Material | null;
  loading: boolean;
  error: string | null;
  
  // Filtros e busca
  searchTerm: string;
  filters: {
    categoryId?: string;
    lowStock?: boolean;
    isActive?: boolean;
  };
  
  // Paginação
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Ações - Materiais
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;
  selectMaterial: (material: Material | null) => void;
  
  // Ações - Categorias
  setCategories: (categories: MaterialCategory[]) => void;
  addCategory: (category: MaterialCategory) => void;
  updateCategory: (id: string, updates: Partial<MaterialCategory>) => void;
  removeCategory: (id: string) => void;
  
  // Ações - Entradas/Saídas
  setEntries: (entries: MaterialEntry[]) => void;
  addEntry: (entry: MaterialEntry) => void;
  
  // Estados de carregamento
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filtros e busca
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<MaterialsState['filters']>) => void;
  clearFilters: () => void;
  
  // Paginação
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setTotalItems: (total: number) => void;
  
  // Utilitários
  getFilteredMaterials: () => Material[];
  getPaginatedMaterials: () => Material[];
  getLowStockMaterials: () => Material[];
  getMaterialsByCategory: (categoryId: string) => Material[];
  getEntriesByMaterial: (materialId: string) => MaterialEntry[];
  reset: () => void;
}

const initialState = {
  materials: [],
  categories: [],
  entries: [],
  selectedMaterial: null,
  loading: false,
  error: null,
  searchTerm: '',
  filters: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

export const useMaterialsStore = create<MaterialsState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Ações - Materiais
      setMaterials: (materials) => 
        set({ materials, totalItems: materials.length }, false, 'setMaterials'),
      
      addMaterial: (material) =>
        set((state) => ({
          materials: [...state.materials, material],
          totalItems: state.totalItems + 1,
        }), false, 'addMaterial'),
      
      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map(m =>
            m.id === id ? { ...m, ...updates } : m
          ),
          selectedMaterial: state.selectedMaterial?.id === id
            ? { ...state.selectedMaterial, ...updates }
            : state.selectedMaterial,
        }), false, 'updateMaterial'),
      
      removeMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter(m => m.id !== id),
          selectedMaterial: state.selectedMaterial?.id === id ? null : state.selectedMaterial,
          totalItems: state.totalItems - 1,
        }), false, 'removeMaterial'),
      
      selectMaterial: (material) =>
        set({ selectedMaterial: material }, false, 'selectMaterial'),
      
      // Ações - Categorias
      setCategories: (categories) => set({ categories }, false, 'setCategories'),
      
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        }), false, 'addCategory'),
      
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map(c =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }), false, 'updateCategory'),
      
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter(c => c.id !== id),
        }), false, 'removeCategory'),
      
      // Ações - Entradas/Saídas
      setEntries: (entries) => set({ entries }, false, 'setEntries'),
      
      addEntry: (entry) =>
        set((state) => {
          // Atualizar estoque do material
          const updatedMaterials = state.materials.map(material => {
            if (material.id === entry.materialId) {
              const newStock = entry.entryType === 'in' 
                ? material.currentStock + entry.quantity
                : material.currentStock - entry.quantity;
              
              return { ...material, currentStock: Math.max(0, newStock) };
            }
            return material;
          });
          
          return {
            entries: [...state.entries, entry],
            materials: updatedMaterials,
          };
        }, false, 'addEntry'),
      
      // Estados de carregamento
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),
      
      // Filtros e busca
      setSearchTerm: (searchTerm) =>
        set({ searchTerm, currentPage: 1 }, false, 'setSearchTerm'),
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        }), false, 'setFilters'),
      
      clearFilters: () =>
        set({ filters: {}, searchTerm: '', currentPage: 1 }, false, 'clearFilters'),
      
      // Paginação
      setCurrentPage: (currentPage) => set({ currentPage }, false, 'setCurrentPage'),
      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }, false, 'setItemsPerPage'),
      setTotalItems: (totalItems) => set({ totalItems }, false, 'setTotalItems'),
      
      // Utilitários
      getFilteredMaterials: () => {
        const { materials, searchTerm, filters } = get();
        
        return materials.filter(material => {
          // Filtro de busca
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
              material.name.toLowerCase().includes(searchLower) ||
              material.brand?.toLowerCase().includes(searchLower) ||
              material.supplierName?.toLowerCase().includes(searchLower);
            
            if (!matchesSearch) return false;
          }
          
          // Filtros específicos
          if (filters.categoryId && material.categoryId !== filters.categoryId) {
            return false;
          }
          
          if (filters.lowStock && material.currentStock >= material.minStockLevel) {
            return false;
          }
          
          if (filters.isActive !== undefined && material.isActive !== filters.isActive) {
            return false;
          }
          
          return true;
        });
      },
      
      getPaginatedMaterials: () => {
        const { currentPage, itemsPerPage } = get();
        const filtered = get().getFilteredMaterials();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return filtered.slice(startIndex, endIndex);
      },
      
      getLowStockMaterials: () => {
        const { materials } = get();
        return materials.filter(material => 
          material.isActive && material.currentStock <= material.minStockLevel
        );
      },
      
      getMaterialsByCategory: (categoryId) => {
        const { materials } = get();
        return materials.filter(material => material.categoryId === categoryId);
      },
      
      getEntriesByMaterial: (materialId) => {
        const { entries } = get();
        return entries.filter(entry => entry.materialId === materialId);
      },
      
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'materials-store',
    }
  )
);