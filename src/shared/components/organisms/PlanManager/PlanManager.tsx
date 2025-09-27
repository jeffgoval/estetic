import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Users, 
  Calendar, 
  UserCheck,
  Save,
  X
} from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Modal } from '../Modal';
import type { SuperAdminSubscriptionPlan, CreateSuperAdminSubscriptionPlan } from '../../../types/superAdmin';

interface PlanManagerProps {
  plans: SuperAdminSubscriptionPlan[];
  loading?: boolean;
  onCreatePlan: (plan: CreateSuperAdminSubscriptionPlan) => Promise<void>;
  onUpdatePlan: (id: string, plan: Partial<SuperAdminSubscriptionPlan>) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
  onTogglePlanStatus: (id: string, isActive: boolean) => Promise<void>;
}

interface PlanFormData {
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_patients: number;
  max_appointments_per_month: number;
  features: Record<string, any>;
  is_popular: boolean;
  sort_order: number;
}

const initialFormData: PlanFormData = {
  name: '',
  description: '',
  price_monthly: 0,
  price_yearly: 0,
  max_users: 10,
  max_patients: 100,
  max_appointments_per_month: 500,
  features: {},
  is_popular: false,
  sort_order: 0,
};

export const PlanManager: React.FC<PlanManagerProps> = ({
  plans,
  loading = false,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onTogglePlanStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SuperAdminSubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (plan?: SuperAdminSubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly || 0,
        max_users: plan.max_users || 10,
        max_patients: plan.max_patients || 100,
        max_appointments_per_month: plan.max_appointments_per_month || 500,
        features: plan.features || {},
        is_popular: plan.is_popular,
        sort_order: plan.sort_order,
      });
    } else {
      setEditingPlan(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPlan) {
        await onUpdatePlan(editingPlan.id, formData);
      } else {
        await onCreatePlan(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan: SuperAdminSubscriptionPlan) => {
    if (confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) {
      try {
        await onDeletePlan(plan.id);
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
      }
    }
  };

  const handleToggleStatus = async (plan: SuperAdminSubscriptionPlan) => {
    try {
      await onTogglePlanStatus(plan.id, !plan.is_active);
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPlanColor = (plan: SuperAdminSubscriptionPlan) => {
    if (!plan.is_active) return 'bg-gray-100 border-gray-200';
    if (plan.is_popular) return 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gerenciar Planos</h3>
          <p className="text-sm text-gray-600">Configure os planos de assinatura disponíveis</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Plano</span>
        </Button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-64"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border-2 p-6 relative transition-all duration-200 hover:shadow-lg ${getPlanColor(plan)}`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.is_active 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {plan.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Plan Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(plan.price_monthly)}
                    </span>
                    <span className="text-sm text-gray-600">/mês</span>
                  </div>
                  {plan.price_yearly && plan.price_yearly > 0 && (
                    <div className="text-sm text-gray-600">
                      ou {formatCurrency(plan.price_yearly)}/ano
                      <span className="ml-1 text-emerald-600 font-medium">
                        (economize {Math.round((1 - (plan.price_yearly / 12) / plan.price_monthly) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Limits */}
                <div className="space-y-2 text-sm text-gray-600">
                  {plan.max_users && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Até {plan.max_users} usuários</span>
                    </div>
                  )}
                  {plan.max_patients && (
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Até {plan.max_patients} pacientes</span>
                    </div>
                  )}
                  {plan.max_appointments_per_month && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Até {plan.max_appointments_per_month} agendamentos/mês</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar plano"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir plano"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      plan.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {plan.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nome do Plano"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Plano Básico"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição do plano..."
              />
            </div>

            <Input
              label="Preço Mensal (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_monthly}
              onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
              required
            />

            <Input
              label="Preço Anual (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_yearly}
              onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
            />

            <Input
              label="Máximo de Usuários"
              type="number"
              min="1"
              value={formData.max_users}
              onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 1 })}
            />

            <Input
              label="Máximo de Pacientes"
              type="number"
              min="1"
              value={formData.max_patients}
              onChange={(e) => setFormData({ ...formData, max_patients: parseInt(e.target.value) || 1 })}
            />

            <Input
              label="Agendamentos/Mês"
              type="number"
              min="1"
              value={formData.max_appointments_per_month}
              onChange={(e) => setFormData({ ...formData, max_appointments_per_month: parseInt(e.target.value) || 1 })}
            />

            <Input
              label="Ordem de Exibição"
              type="number"
              min="0"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Marcar como popular</span>
            </label>
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

export default PlanManager;