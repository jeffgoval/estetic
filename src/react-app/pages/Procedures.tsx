import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';


import { PERMISSIONS } from '@/shared/permissions';
import { 
  FileText, 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Package,
  X,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import type { Procedure, CreateProcedure, Material, ProcedureMaterial } from '@/shared/types';

interface ProcedureWithMaterials extends Procedure {
  materials?: ProcedureMaterialWithDetails[];
}

interface ProcedureMaterialWithDetails extends ProcedureMaterial {
  material_name: string;
  unit_type: string;
  unit_cost: number;
  current_stock: number;
  category_name?: string;
}

export default function ProceduresPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState<ProcedureWithMaterials[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  
  const [editingProcedure, setEditingProcedure] = useState<ProcedureWithMaterials | null>(null);
  const [expandedProcedure, setExpandedProcedure] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CreateProcedure & { procedure_category_id?: number }>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    fixed_price: 0,
    variable_price_notes: '',
    materials_cost: 0,
    profit_margin: 0,
    category: 'Estética Facial',
    complexity_level: 1,
  });
  const [procedureMaterials, setProcedureMaterials] = useState<{
    material_id: number;
    quantity_required: number;
    is_mandatory: boolean;
    notes: string;
  }[]>([]);

  const categories = [
    'Estética Facial',
    'Estética Corporal',
    'Estética Capilar',
    'Estética Íntima',
    'Procedimentos Avançados'
  ];

  

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      fixed_price: 0,
      variable_price_notes: '',
      materials_cost: 0,
      profit_margin: 0,
      category: 'Estética Facial',
      complexity_level: 1,
    });
    setProcedureMaterials([]);
    setEditingProcedure(null);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [proceduresResponse, materialsResponse] = await Promise.all([
        fetch('/api/procedures?detailed=true'),
        fetch('/api/materials')
      ]);

      const [proceduresData, materialsData] = await Promise.all([
        proceduresResponse.json(),
        materialsResponse.json()
      ]);

      setProcedures(proceduresData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProcedure ? `/api/procedures/${editingProcedure.id}` : '/api/procedures';
      const method = editingProcedure ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedProcedure = await response.json();
        
        // Save materials if any
        if (procedureMaterials.length > 0) {
          for (const material of procedureMaterials) {
            await fetch(`/api/procedures/${savedProcedure.id}/materials`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(material),
            });
          }
        }

        await fetchData();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving procedure:', error);
    }
  }, [editingProcedure, formData, procedureMaterials, fetchData, resetForm]);

  const handleEdit = (procedure: ProcedureWithMaterials) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      description: procedure.description || '',
      duration_minutes: procedure.duration_minutes,
      price: procedure.price || 0,
      fixed_price: procedure.fixed_price || 0,
      variable_price_notes: procedure.variable_price_notes || '',
      materials_cost: procedure.materials_cost || 0,
      profit_margin: procedure.profit_margin || 0,
      category: procedure.category || 'Estética Facial',
      complexity_level: procedure.complexity_level || 1,
    });
    
    // Set current materials
    if (procedure.materials) {
      setProcedureMaterials(procedure.materials.map(m => ({
        material_id: m.material_id,
        quantity_required: m.quantity_required,
        is_mandatory: m.is_mandatory,
        notes: m.notes || ''
      })));
    } else {
      setProcedureMaterials([]);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (procedureId: number) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      try {
        const response = await fetch(`/api/procedures/${procedureId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting procedure:', error);
      }
    }
  };

  const addMaterial = () => {
    setProcedureMaterials([...procedureMaterials, {
      material_id: 0,
      quantity_required: 1,
      is_mandatory: true,
      notes: ''
    }]);
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const updated = [...procedureMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setProcedureMaterials(updated);
  };

  const removeMaterial = (index: number) => {
    setProcedureMaterials(procedureMaterials.filter((_, i) => i !== index));
  };

  

  const calculateTotalMaterialsCost = useCallback(() => {
    return procedureMaterials.reduce((total, pm) => {
      const material = materials.find(m => m.id === pm.material_id);
      return total + (material ? material.unit_cost * pm.quantity_required : 0);
    }, 0);
  }, [procedureMaterials, materials]);

  const filteredProcedures = useMemo(() => {
    return procedures.filter(procedure => {
      const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (procedure.description && procedure.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || procedure.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [procedures, searchTerm, filterCategory]);

  const getCategoryColor = useCallback((category: string) => {
    const colors: { [key: string]: string } = {
      'Estética Facial': 'bg-pink-100 text-pink-800',
      'Estética Corporal': 'bg-purple-100 text-purple-800',
      'Estética Capilar': 'bg-indigo-100 text-indigo-800',
      'Estética Íntima': 'bg-rose-100 text-rose-800',
      'Procedimentos Avançados': 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }, []);

  

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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Procedimentos</h2>
              <p className="text-gray-600">Gerencie os procedimentos oferecidos pela clínica</p>
            </div>
            
            <div className="flex space-x-3">
              
              
              <PermissionGate requiredPermissions={[PERMISSIONS.APPOINTMENT_CREATE]}>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Procedimento</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar procedimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{filteredProcedures.length} procedimentos</span>
            </div>
          </div>
        </div>

        {/* Procedures List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando procedimentos...</p>
            </div>
          ) : filteredProcedures.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredProcedures.map((procedure) => (
                <div key={`procedure-${procedure.id}`} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                          <FileText className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{procedure.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(procedure.category || 'Categoria')}`}>
                              {procedure.category || 'Categoria'}
                            </span>
                          </div>

                          {procedure.description && (
                            <p className="text-gray-600 text-sm">{procedure.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{procedure.duration_minutes} min</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>R$ {(procedure.fixed_price || 0).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Package className="w-4 h-4" />
                              <span>R$ {(procedure.materials_cost || 0).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <TrendingUp className="w-4 h-4" />
                              <span>{(procedure.profit_margin || 0).toFixed(1)}%</span>
                            </div>
                          </div>

                          {procedure.variable_price_notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-yellow-800 text-sm font-medium">Preço Variável</p>
                                  <p className="text-yellow-700 text-sm">{procedure.variable_price_notes}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Materials section */}
                          {procedure.materials && procedure.materials.length > 0 && (
                            <div>
                              <button
                                onClick={() => setExpandedProcedure(expandedProcedure === procedure.id ? null : procedure.id)}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <Package className="w-4 h-4" />
                                <span>{procedure.materials.length} materiais</span>
                                {expandedProcedure === procedure.id ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </button>

                              {expandedProcedure === procedure.id && (
                                <div className="mt-3 pl-6 border-l-2 border-blue-200 space-y-2">
                                  {procedure.materials.map((material) => (
                                    <div key={`material-${material.id}-${material.material_id}`} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${material.is_mandatory ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-sm font-medium">{material.material_name}</span>
                                        <span className="text-xs text-gray-500">
                                          {material.quantity_required} {material.unit_type}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-600">
                                        R$ {(material.unit_cost * material.quantity_required).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <PermissionGate requiredPermissions={[PERMISSIONS.APPOINTMENT_CREATE]}>
                        <button
                          onClick={() => handleEdit(procedure)}
                          className="p-2 text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(procedure.id)}
                          className="p-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Nenhum procedimento encontrado com os filtros aplicados'
                  : 'Nenhum procedimento cadastrado'
                }
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-primary hover:text-primary font-medium"
              >
                Cadastrar primeiro procedimento
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Procedimento *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Ex: Limpeza, Restauração, Canal..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map((category, categoryIndex) => (
                          <option key={`procedure-filter-category-${categoryIndex}-${category}`} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duração (minutos) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descrição detalhada do procedimento..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Precificação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço Fixo (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.fixed_price}
                        onChange={(e) => setFormData({ ...formData, fixed_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custo Materiais (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={calculateTotalMaterialsCost()}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Margem de Lucro (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.profit_margin}
                        onChange={(e) => setFormData({ ...formData, profit_margin: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações sobre Preço Variável
                      </label>
                      <textarea
                        rows={2}
                        value={formData.variable_price_notes}
                        onChange={(e) => setFormData({ ...formData, variable_price_notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Preço varia conforme número de canais, dentes envolvidos, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Materiais Necessários</h4>
                    <button
                      type="button"
                      onClick={addMaterial}
                      className="btn-secondary px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Material</span>
                    </button>
                  </div>

                  {procedureMaterials.length > 0 ? (
                    <div className="space-y-3">
                      {procedureMaterials.map((pm, index) => (
                        <div key={`procedure-material-${index}-${pm.material_id}`} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <select
                            value={pm.material_id}
                            onChange={(e) => updateMaterial(index, 'material_id', parseInt(e.target.value))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value={0}>Selecione um material</option>
                            {materials.map(material => (
                              <option key={`procedure-material-option-${material.id}`} value={material.id}>
                                {material.name} ({material.unit_type})
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={pm.quantity_required}
                            onChange={(e) => updateMaterial(index, 'quantity_required', parseFloat(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Qtd"
                          />

                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={pm.is_mandatory}
                              onChange={(e) => updateMaterial(index, 'is_mandatory', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Obrigatório</span>
                          </label>

                          <input
                            type="text"
                            value={pm.notes}
                            onChange={(e) => updateMaterial(index, 'notes', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Observações"
                          />

                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="p-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-900">Custo Total dos Materiais:</span>
                        <span className="font-bold text-blue-900">R$ {calculateTotalMaterialsCost().toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhum material adicionado</p>
                      <p className="text-sm">Clique em "Adicionar Material" para começar</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProcedure ? 'Atualizar' : 'Salvar'} Procedimento</span>
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
