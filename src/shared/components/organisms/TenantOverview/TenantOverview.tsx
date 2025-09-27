import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  UserCheck,
  Activity,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
// import { Button } from '../../atoms/Button'; // Não utilizado no momento
import type { SuperAdminTenantOverview } from '../../../types/superAdmin';

interface TenantOverviewProps {
  tenants: SuperAdminTenantOverview[];
  loading?: boolean;
  onToggleTenantStatus: (id: string, isActive: boolean) => Promise<void>;
  onViewTenantDetails: (tenant: SuperAdminTenantOverview) => void;
}

export const TenantOverview: React.FC<TenantOverviewProps> = ({
  tenants,
  loading = false,
  onToggleTenantStatus,
  onViewTenantDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'last_activity' | 'user_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleToggleStatus = async (tenant: SuperAdminTenantOverview) => {
    const action = tenant.is_active ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} a clínica "${tenant.name}"?`)) {
      try {
        await onToggleTenantStatus(tenant.id, !tenant.is_active);
      } catch (error) {
        console.error('Erro ao alterar status do tenant:', error);
      }
    }
  };

  const getStatusInfo = (tenant: SuperAdminTenantOverview) => {
    if (!tenant.is_active) {
      return { 
        label: 'Inativa', 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle 
      };
    }
    
    switch (tenant.subscription_status) {
      case 'active':
        return { 
          label: 'Ativa', 
          color: 'bg-emerald-100 text-emerald-800', 
          icon: CheckCircle 
        };
      case 'trial':
        return { 
          label: 'Trial', 
          color: 'bg-blue-100 text-blue-800', 
          icon: Clock 
        };
      case 'past_due':
        return { 
          label: 'Vencida', 
          color: 'bg-orange-100 text-orange-800', 
          icon: AlertTriangle 
        };
      case 'suspended':
        return { 
          label: 'Suspensa', 
          color: 'bg-red-100 text-red-800', 
          icon: XCircle 
        };
      case 'cancelled':
        return { 
          label: 'Cancelada', 
          color: 'bg-gray-100 text-gray-800', 
          icon: XCircle 
        };
      default:
        return { 
          label: 'Desconhecido', 
          color: 'bg-gray-100 text-gray-800', 
          icon: AlertTriangle 
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Sem atividade';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    return formatDate(dateString);
  };

  const filteredAndSortedTenants = tenants
    .filter(tenant => {
      const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (tenant.subdomain && tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && tenant.is_active && tenant.subscription_status === 'active') ||
        (statusFilter === 'trial' && tenant.subscription_status === 'trial') ||
        (statusFilter === 'suspended' && (!tenant.is_active || tenant.subscription_status === 'suspended'));
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'last_activity':
          aValue = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          bValue = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          break;
        case 'user_count':
          aValue = a.user_count;
          bValue = b.user_count;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Visão Geral dos Tenants</h3>
        <p className="text-sm text-gray-600">Monitore todas as clínicas da plataforma</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clínicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="trial">Em trial</option>
              <option value="suspended">Suspensas</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {filteredAndSortedTenants.length} de {tenants.length} clínicas
        </div>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-20"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div 
                className="col-span-3 flex items-center space-x-1 cursor-pointer hover:text-gray-900"
                onClick={() => handleSort('name')}
              >
                <span>Clínica</span>
                {getSortIcon('name')}
              </div>
              <div className="col-span-2 text-center">Status</div>
              <div 
                className="col-span-1 text-center cursor-pointer hover:text-gray-900 flex items-center justify-center space-x-1"
                onClick={() => handleSort('user_count')}
              >
                <span>Usuários</span>
                {getSortIcon('user_count')}
              </div>
              <div className="col-span-1 text-center">Pacientes</div>
              <div className="col-span-1 text-center">Agendamentos</div>
              <div 
                className="col-span-2 text-center cursor-pointer hover:text-gray-900 flex items-center justify-center space-x-1"
                onClick={() => handleSort('last_activity')}
              >
                <span>Última Atividade</span>
                {getSortIcon('last_activity')}
              </div>
              <div 
                className="col-span-1 text-center cursor-pointer hover:text-gray-900 flex items-center justify-center space-x-1"
                onClick={() => handleSort('created_at')}
              >
                <span>Criado</span>
                {getSortIcon('created_at')}
              </div>
              <div className="col-span-1 text-center">Ações</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredAndSortedTenants.map((tenant) => {
              const statusInfo = getStatusInfo(tenant);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={tenant.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Clínica */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{tenant.name}</h4>
                          {tenant.subdomain && (
                            <p className="text-xs text-gray-500">{tenant.subdomain}.app.com</p>
                          )}
                          {tenant.plan_name && (
                            <p className="text-xs text-blue-600">{tenant.plan_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Usuários */}
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{tenant.user_count}</span>
                      </div>
                    </div>

                    {/* Pacientes */}
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{tenant.patient_count}</span>
                      </div>
                    </div>

                    {/* Agendamentos */}
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{tenant.appointment_count}</span>
                      </div>
                    </div>

                    {/* Última Atividade */}
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatLastActivity(tenant.last_activity)}
                        </span>
                      </div>
                    </div>

                    {/* Criado */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-gray-600">
                        {formatDate(tenant.created_at)}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onViewTenantDetails(tenant)}
                          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            tenant.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {tenant.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAndSortedTenants.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Nenhuma clínica encontrada com os filtros aplicados'
                    : 'Nenhuma clínica cadastrada'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantOverview;