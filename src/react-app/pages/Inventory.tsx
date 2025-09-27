import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  Package, 
  Plus, 
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  X,
  DollarSign,
  Archive,
  AlertCircle,
  CheckCircle,
  Box,
  
} from 'lucide-react';
import type { 
  Material, 
  CreateMaterial, 
  MaterialCategory,
  MaterialEntry,
  CreateMaterialEntry,
  MaterialAlert,
  MaterialConsumption
} from '@/shared/types';

interface MaterialWithCategory extends Material {
  category_name?: string;
}

interface MaterialEntryWithDetails extends MaterialEntry {
  material_name: string;
  unit_type: string;
}

interface MaterialAlertWithDetails extends MaterialAlert {
  material_name: string;
}

interface MaterialConsumptionWithDetails extends MaterialConsumption {
  material_name: string;
  unit_type: string;
  appointment_title?: string;
  procedure_name?: string;
}

export default function InventoryPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'materials' | 'entries' | 'consumption' | 'alerts'>('materials');
  const [materials, setMaterials] = useState<MaterialWithCategory[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [entries, setEntries] = useState<MaterialEntryWithDetails[]>([]);
  const [consumption, setConsumption] = useState<MaterialConsumptionWithDetails[]>([]);
  const [alerts, setAlerts] = useState<MaterialAlertWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithCategory | null>(null);

  // Form states
  const [materialForm, setMaterialForm] = useState<CreateMaterial>({
    category_id: undefined,
    name: '',
    brand: '',
    description: '',
    unit_type: 'unidade',
    min_stock_level: 0,
    max_stock_level: 100,
    unit_cost: 0,
    supplier_name: '',
    supplier_contact: ''
  });

  

  const [entryForm, setEntryForm] = useState<CreateMaterialEntry>({
    material_id: 0,
    entry_type: 'in',
    quantity: 1,
    unit_cost: 0,
    expiry_date: '',
    batch_number: '',
    supplier_name: '',
    invoice_number: '',
    notes: ''
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [materialsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/materials${filterLowStock ? '?low_stock=true' : ''}`),
        fetch('/api/material-categories')
      ]);

      const [materialsData, categoriesData] = await Promise.all([
        materialsResponse.json(),
        categoriesResponse.json()
      ]);

      setMaterials(materialsData);
      setCategories(categoriesData);

      // Fetch additional data based on active tab
      if (activeTab === 'entries') {
        const entriesResponse = await fetch('/api/material-entries');
        const entriesData = await entriesResponse.json();
        setEntries(entriesData);
      } else if (activeTab === 'consumption') {
        const consumptionResponse = await fetch('/api/material-consumption');
        const consumptionData = await consumptionResponse.json();
        setConsumption(consumptionData);
      } else if (activeTab === 'alerts') {
        const alertsResponse = await fetch('/api/material-alerts');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialForm),
      });

      if (response.ok) {
        await fetchData();
        resetMaterialForm();
        setShowMaterialModal(false);
      }
    } catch (error) {
      console.error('Error creating material:', error);
    }
  };

  

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/material-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryForm),
      });

      if (response.ok) {
        await fetchData();
        resetEntryForm();
        setShowEntryModal(false);
      }
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const handleMarkAlertAsRead = async (alertId: number) => {
    try {
      await fetch(`/api/material-alerts/${alertId}/read`, {
        method: 'PATCH',
      });
      await fetchData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      category_id: undefined,
      name: '',
      brand: '',
      description: '',
      unit_type: 'unidade',
      min_stock_level: 0,
      max_stock_level: 100,
      unit_cost: 0,
      supplier_name: '',
      supplier_contact: ''
    });
  };

  

  const resetEntryForm = () => {
    setEntryForm({
      material_id: 0,
      entry_type: 'in',
      quantity: 1,
      unit_cost: 0,
      expiry_date: '',
      batch_number: '',
      supplier_name: '',
      invoice_number: '',
      notes: ''
    });
  };

  

  const handleDeactivateMaterial = async (materialId: number) => {
    if (!confirm('Tem certeza que deseja desativar este material?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false })
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao desativar material');
      }
    } catch (error) {
      console.error('Error deactivating material:', error);
      alert('Erro ao desativar material');
    }
  };

  const getStockStatus = (material: MaterialWithCategory) => {
    if (material.current_stock <= material.min_stock_level) {
      return { status: 'low', color: 'text-red-600 bg-red-50 border-red-200', label: 'Estoque Baixo' };
    } else if (material.current_stock >= material.max_stock_level) {
      return { status: 'high', color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Estoque Alto' };
    }
    return { status: 'normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Normal' };
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !filterLowStock || material.current_stock <= material.min_stock_level;
    
    return matchesSearch && matchesLowStock;
  });

  const stats = {
    totalMaterials: materials.length,
    lowStockItems: materials.filter(m => m.current_stock <= m.min_stock_level).length,
    totalValue: materials.reduce((sum, m) => sum + (m.current_stock * m.unit_cost), 0),
    unreadAlerts: alerts.filter(a => !a.is_read).length
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { key: 'materials', label: 'Materiais', icon: Package, count: materials.length },
    { key: 'entries', label: 'Movimentações', icon: Archive, count: entries.length },
    { key: 'consumption', label: 'Consumo', icon: TrendingDown, count: consumption.length },
    { key: 'alerts', label: 'Alertas', icon: AlertTriangle, count: alerts.filter(a => !a.is_read).length }
  ];

  return (
    <Layout>
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header with Stats */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Controle de Estoque</h2>
              <p className="text-sm md:text-base text-gray-600">Gerencie materiais, estoque e movimentações</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-blue-50 p-3 md:p-4 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs font-medium text-blue-600">Total Materiais</p>
                    <p className="text-lg md:text-xl font-bold text-blue-900">{stats.totalMaterials}</p>
                  </div>
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600 self-end md:self-auto" />
                </div>
              </div>
              
              <div className="bg-red-50 p-3 md:p-4 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs font-medium text-red-600">Estoque Baixo</p>
                    <p className="text-lg md:text-xl font-bold text-red-900">{stats.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600 self-end md:self-auto" />
                </div>
              </div>
              
              <div className="bg-emerald-50 p-3 md:p-4 rounded-xl col-span-2 md:col-span-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs font-medium text-emerald-600">Valor Total</p>
                    <p className="text-base md:text-lg font-bold text-emerald-900">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 self-end md:self-auto" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-3 md:p-4 rounded-xl lg:col-span-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs font-medium text-orange-600">Alertas</p>
                    <p className="text-lg md:text-xl font-bold text-orange-900">{stats.unreadAlerts}</p>
                  </div>
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-600 self-end md:self-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex items-center justify-between px-4 md:px-6">
              <div className="flex space-x-4 md:space-x-8 min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex items-center space-x-2 py-3 md:py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                      {tab.count > 0 && (
                        <span className={`px-1.5 py-0.5 md:px-2 rounded-full text-xs font-medium ${
                          activeTab === tab.key 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Botão Novo Material - agora na linha das abas */}
              {activeTab === 'materials' && (
                <PermissionGate requiredPermissions={[PERMISSIONS.MATERIAL_CREATE]}>
                  <button
                    onClick={() => setShowMaterialModal(true)}
                    className="btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Material</span>
                    <span className="sm:hidden">Novo</span>
                  </button>
                </PermissionGate>
              )}
              
              {/* Botão Nova Movimentação - agora na linha das abas */}
              {activeTab === 'entries' && (
                <PermissionGate requiredPermissions={[PERMISSIONS.MATERIAL_ENTRY_CREATE]}>
                  <button
                    onClick={() => setShowEntryModal(true)}
                    className="btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Movimentação</span>
                    <span className="sm:hidden">Nova</span>
                  </button>
                </PermissionGate>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col space-y-4">
                  {/* Search and Low Stock Filter */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <input
                        type="text"
                        placeholder="Buscar materiais..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                      />
                    </div>

                    <label className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border">
                      <input
                        type="checkbox"
                        checked={filterLowStock}
                        onChange={(e) => setFilterLowStock(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs md:text-sm text-gray-700 whitespace-nowrap">Estoque baixo</span>
                    </label>
                  </div>

                  
                </div>

                {/* Materials Grid */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando materiais...</p>
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredMaterials.map((material) => {
                      const stockStatus = getStockStatus(material);
                      const stockPercentage = material.max_stock_level > 0 
                        ? (material.current_stock / material.max_stock_level) * 100 
                        : 0;

                      return (
                        <div key={`material-row-${material.id}`} className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate pr-2">{material.name}</h3>
                              {material.brand && (
                                <p className="text-sm text-gray-600 truncate">{material.brand}</p>
                              )}
                              {material.category_name && (
                                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {material.category_name}
                                </span>
                              )}
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <div className="flex space-x-1">
                                <PermissionGate requiredPermissions={[PERMISSIONS.MATERIAL_ENTRY_CREATE]}>
                                  <button
                                    onClick={() => {
                                      setSelectedMaterial(material);
                                      setEntryForm({ ...entryForm, material_id: material.id });
                                      setShowEntryModal(true);
                                    }}
                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Adicionar entrada"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </PermissionGate>
                                <PermissionGate requiredPermissions={[PERMISSIONS.INVENTORY_MANAGE]}>
                                  <button
                                    onClick={() => handleDeactivateMaterial(material.id)}
                                    className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Desativar material"
                                  >
                                    <AlertCircle className="w-4 h-4" />
                                  </button>
                                </PermissionGate>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Estoque:</span>
                              <span className="font-semibold text-sm md:text-base">{material.current_stock} {material.unit_type}</span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                  {stockStatus.label}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    stockStatus.status === 'low' ? 'bg-red-500' :
                                    stockStatus.status === 'high' ? 'bg-orange-500' :
                                    'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Min: {material.min_stock_level}</span>
                                <span>Max: {material.max_stock_level}</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Unitário:</span>
                                <span className="font-medium">R$ {material.unit_cost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-medium text-emerald-600">
                                  R$ {(material.current_stock * material.unit_cost).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {material.supplier_name && (
                              <div className="text-xs text-gray-500 truncate">
                                Fornecedor: {material.supplier_name}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm || filterLowStock 
                        ? 'Nenhum material encontrado com os filtros aplicados'
                        : 'Nenhum material cadastrado'
                      }
                    </p>
                    {!searchTerm && !filterLowStock && (
                      <button
                        onClick={() => setShowMaterialModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Cadastrar primeiro material
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Entries Tab */}
            {activeTab === 'entries' && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">Movimentações de Estoque</h3>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando movimentações...</p>
                  </div>
                ) : entries.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {entries.slice(0, 20).map((entry) => (
                        <div key={`entry-row-${entry.id}`} className="p-3 md:p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between space-x-3">
                            <div className="flex items-start space-x-3 min-w-0 flex-1">
                              <div className={`p-2 rounded-full flex-shrink-0 ${
                                entry.entry_type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {entry.entry_type === 'in' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-900 truncate text-sm md:text-base">{entry.material_name}</h4>
                                <div className="mt-1">
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">{entry.entry_type === 'in' ? 'Entrada' : 'Saída'}:</span> {entry.quantity} {entry.unit_type}
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                    {entry.supplier_name && <span>• {entry.supplier_name}</span>}
                                    {entry.batch_number && <span>• Lote: {entry.batch_number}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-medium text-gray-900 text-sm md:text-base">
                                R$ {entry.total_cost.toFixed(2)}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500">
                                {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma movimentação registrada</p>
                  </div>
                )}
              </div>
            )}

            {/* Consumption Tab */}
            {activeTab === 'consumption' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Histórico de Consumo</h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando histórico...</p>
                  </div>
                ) : consumption.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {consumption.slice(0, 20).map((record) => (
                        <div key={record.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                                <TrendingDown className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{record.material_name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Consumo: {record.quantity_used} {record.unit_type}</span>
                                  {record.appointment_title && <span>• {record.appointment_title}</span>}
                                  {record.procedure_name && <span>• {record.procedure_name}</span>}
                                </div>
                                {record.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              {new Date(record.consumed_at).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(record.consumed_at).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum consumo registrado</p>
                  </div>
                )}
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Alertas do Sistema</h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando alertas...</p>
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${
                        alert.is_read ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                              alert.is_read ? 'text-gray-400' : 'text-orange-600'
                            }`} />
                            <div>
                              <h4 className={`font-medium ${
                                alert.is_read ? 'text-gray-700' : 'text-orange-800'
                              }`}>
                                {alert.alert_message}
                              </h4>
                              <p className={`text-sm ${
                                alert.is_read ? 'text-gray-500' : 'text-orange-600'
                              }`}>
                                Material: {alert.material_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(alert.created_at).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(alert.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {!alert.is_read && (
                            <button
                              onClick={() => handleMarkAlertAsRead(alert.id)}
                              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                              Marcar como lido
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum alerta no momento</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Material Modal */}
        {showMaterialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Novo Material</h3>
                <button
                  onClick={() => {
                    setShowMaterialModal(false);
                    resetMaterialForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMaterial} className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Material *
                    </label>
                    <input
                      type="text"
                      required
                      value={materialForm.name}
                      onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Luvas de procedimento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={materialForm.category_id || ''}
                      onChange={(e) => setMaterialForm({ ...materialForm, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={`inventory-filter-category-${category.id}`} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={materialForm.brand}
                      onChange={(e) => setMaterialForm({ ...materialForm, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Descarpack"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidade *
                    </label>
                    <select
                      required
                      value={materialForm.unit_type}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="unidade">Unidade</option>
                      <option value="caixa">Caixa</option>
                      <option value="pacote">Pacote</option>
                      <option value="frasco">Frasco</option>
                      <option value="tubo">Tubo</option>
                      <option value="ml">ML</option>
                      <option value="kg">KG</option>
                      <option value="metro">Metro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custo Unitário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={materialForm.unit_cost}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={materialForm.min_stock_level}
                      onChange={(e) => setMaterialForm({ ...materialForm, min_stock_level: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estoque Máximo
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={materialForm.max_stock_level}
                      onChange={(e) => setMaterialForm({ ...materialForm, max_stock_level: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={materialForm.supplier_name}
                      onChange={(e) => setMaterialForm({ ...materialForm, supplier_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome do fornecedor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contato do Fornecedor
                    </label>
                    <input
                      type="text"
                      value={materialForm.supplier_contact}
                      onChange={(e) => setMaterialForm({ ...materialForm, supplier_contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Telefone ou email"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrição detalhada do material..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaterialModal(false);
                      resetMaterialForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-lg transition-all duration-200"
                  >
                    Cadastrar Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        

        {/* Entry Modal */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 truncate pr-2">
                  {selectedMaterial ? `Entrada - ${selectedMaterial.name}` : 'Nova Movimentação'}
                </h3>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    setSelectedMaterial(null);
                    resetEntryForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="p-4 md:p-6 space-y-4 md:space-y-6">
                {!selectedMaterial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material *
                    </label>
                    <select
                      required
                      value={entryForm.material_id}
                      onChange={(e) => setEntryForm({ ...entryForm, material_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Selecione um material</option>
                      {materials.map(material => (
                        <option key={`modal-entry-material-${material.id}`} value={material.id}>{material.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={entryForm.entry_type}
                      onChange={(e) => setEntryForm({ ...entryForm, entry_type: e.target.value as 'in' | 'out' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="in">Entrada</option>
                      <option value="out">Saída</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={entryForm.quantity}
                      onChange={(e) => setEntryForm({ ...entryForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custo Unitário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entryForm.unit_cost}
                      onChange={(e) => setEntryForm({ ...entryForm, unit_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Validade
                    </label>
                    <input
                      type="date"
                      value={entryForm.expiry_date}
                      onChange={(e) => setEntryForm({ ...entryForm, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Lote
                    </label>
                    <input
                      type="text"
                      value={entryForm.batch_number}
                      onChange={(e) => setEntryForm({ ...entryForm, batch_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nota Fiscal
                    </label>
                    <input
                      type="text"
                      value={entryForm.invoice_number}
                      onChange={(e) => setEntryForm({ ...entryForm, invoice_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Número da NF"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={entryForm.supplier_name}
                    onChange={(e) => setEntryForm({ ...entryForm, supplier_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações sobre esta movimentação..."
                  />
                </div>

                {entryForm.quantity > 0 && entryForm.unit_cost > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Custo Total:</span>
                      <span className="text-lg font-bold text-blue-900">
                        R$ {(entryForm.quantity * entryForm.unit_cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryModal(false);
                      setSelectedMaterial(null);
                      resetEntryForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Registrar Movimentação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
