// Página principal
export { InventoryPage } from './InventoryPage';

// Tipos
export type {
  Material,
  MaterialCategory,
  MaterialEntry,
  StockAlert,
  MaterialFormData,
  MaterialEntryFormData,
  CategoryFormData,
  InventoryFilters
} from './types';

// Hooks
export { useMaterials, useStockAlerts } from './hooks/useMaterials';
export { useCategories } from './hooks/useCategories';
export { useMaterialEntries } from './hooks/useMaterialEntries';

// Componentes
export { MaterialList } from './components/organisms/MaterialList';
export { MaterialForm } from './components/organisms/MaterialForm';
export { CategoryManager } from './components/organisms/CategoryManager';
export { MaterialEntryForm } from './components/organisms/MaterialEntryForm';
export { MaterialEntryList } from './components/organisms/MaterialEntryList';
export { StockAlerts } from './components/organisms/StockAlerts';
export { MaterialCard } from './components/molecules/MaterialCard';
export { InventoryFilters } from './components/molecules/InventoryFilters';
export { StockBadge } from './components/atoms/StockBadge';
export { EntryTypeBadge } from './components/atoms/EntryTypeBadge';