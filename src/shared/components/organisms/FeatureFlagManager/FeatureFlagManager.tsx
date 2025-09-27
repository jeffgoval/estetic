import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Flag, 
  Star,
  Save,
  X,
  Search,
  Filter,
  Tag
} from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Modal } from '../Modal';
import type { SuperAdminFeatureFlag, CreateSuperAdminFeatureFlag } from '../../../types/superAdmin';

interface FeatureFlagManagerProps {
  featureFlags: SuperAdminFeatureFlag[];
  loading?: boolean;
  onCreateFeatureFlag: (flag: CreateSuperAdminFeatureFlag) => Promise<void>;
  onUpdateFeatureFlag: (id: string, flag: Partial<SuperAdminFeatureFlag>) => Promise<void>;
  onDeleteFeatureFlag: (id: string) => Promise<void>;
}

interface FeatureFlagFormData {
  key: string;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
}

const initialFormData: FeatureFlagFormData = {
  key: '',
  name: '',
  description: '',
  category: '',
  is_premium: false,
};

const CATEGORIES = [
  { value: 'communication', label: 'Comunicação', color: 'bg-blue-100 text-blue-800' },
  { value: 'analytics', label: 'Análises', color: 'bg-purple-100 text-purple-800' },
  { value: 'automation', label: 'Automação', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'integration', label: 'Integração', color: 'bg-orange-100 text-orange-800' },
  { value: 'ai', label: 'Inteligência Artificial', color: 'bg-pink-100 text-pink-800' },
  { value: 'reporting', label: 'Relatórios', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'management', label: 'Gestão', color: 'bg-gray-100 text-gray-800' },
];

export const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({
  featureFlags,
  loading = false,
  onCreateFeatureFlag,
  onUpdateFeatureFlag,
  onDeleteFeatureFlag,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<SuperAdminFeatureFlag | null>(null);
  const [formData, setFormData] = useState<FeatureFlagFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleOpenModal = (flag?: SuperAdminFeatureFlag) => {
    if (flag) {
      setEditingFlag(flag);
      setFormData({
        key: flag.key,
        name: flag.name,
        description: flag.description || '',
        category: flag.category || '',
        is_premium: flag.is_premium,
      });
    } else {
      setEditingFlag(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlag(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingFlag) {
        await onUpdateFeatureFlag(editingFlag.id, formData);
      } else {
        await onCreateFeatureFlag(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar feature flag:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (flag: SuperAdminFeatureFlag) => {
    if (confirm(`Tem certeza que deseja excluir a feature "${flag.name}"?`)) {
      try {
        await onDeleteFeatureFlag(flag.id);
      } catch (error) {
        console.error('Erro ao excluir feature flag:', error);
      }
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category) || 
           { value: category, label: category, color: 'bg-gray-100 text-gray-800' };
  };

  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (flag.description && flag.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || flag.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gerenciar Feature Flags</h3>
          <p className="text-sm text-gray-600">Configure as funcionalidades disponíveis no sistema</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Feature</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as categorias</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Flags List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlags.map((flag) => {
            const categoryInfo = getCategoryInfo(flag.category || '');
            
            return (
              <div
                key={flag.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <Flag className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-medium text-gray-900">{flag.name}</h4>
                      </div>
                      
                      {flag.is_premium && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                      
                      {flag.category && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          <Tag className="w-3 h-3 mr-1" />
                          {categoryInfo.label}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {flag.key}
                        </code>
                      </div>
                      
                      {flag.description && (
                        <p className="text-sm text-gray-600">{flag.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(flag)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar feature"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(flag)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredFlags.length === 0 && (
            <div className="text-center py-12">
              <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Nenhuma feature encontrada com os filtros aplicados'
                  : 'Nenhuma feature flag cadastrada'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFlag ? 'Editar Feature Flag' : 'Nova Feature Flag'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Chave da Feature"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z_]/g, '') })}
              required
              placeholder="Ex: whatsapp_integration"
              disabled={!!editingFlag}
              helperText="Apenas letras minúsculas e underscore. Não pode ser alterada após criação."
            />

            <Input
              label="Nome da Feature"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ex: Integração WhatsApp"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição da funcionalidade..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_premium"
                checked={formData.is_premium}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_premium" className="text-sm text-gray-700">
                Feature premium (disponível apenas em planos pagos)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeatureFlagManager;