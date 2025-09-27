// Tipos para o sistema de gestão de estoque

export interface MaterialCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
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
  
  // Relações
  category?: MaterialCategory;
}

export interface MaterialEntry {
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
  
  // Relações
  material?: Material;
}

export interface StockAlert {
  materialId: string;
  materialName: string;
  currentStock: number;
  minStockLevel: number;
  alertType: 'low_stock' | 'out_of_stock' | 'expired';
  severity: 'warning' | 'critical';
}

export interface MaterialFormData {
  name: string;
  categoryId?: string;
  brand?: string;
  description?: string;
  unitType: string;
  minStockLevel: number;
  maxStockLevel: number;
  currentStock: number;
  unitCost: number;
  supplierName?: string;
  supplierContact?: string;
}

export interface MaterialEntryFormData {
  materialId: string;
  entryType: 'in' | 'out';
  quantity: number;
  unitCost: number;
  expiryDate?: string;
  batchNumber?: string;
  supplierName?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface InventoryFilters {
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  sortBy?: 'name' | 'stock' | 'cost' | 'updated';
  sortOrder?: 'asc' | 'desc';
}