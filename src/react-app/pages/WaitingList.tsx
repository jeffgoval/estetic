import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  Clock, 
  Plus, 
  Calendar,
  User,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  X,
  Search,
  Filter,
  AlertCircle,
  ArrowRight,
  Edit,
  Trash2
} from 'lucide-react';
import type { WaitingList, CreateWaitingList, Patient, Professional, Procedure } from '@/shared/types';

interface WaitingListWithDetails extends WaitingList {
  patient_name: string;
  patient_phone?: string;
  professional_name?: string;
  procedure_name?: string;
}

export default function WaitingListPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [waitingList, setWaitingList] = useState<WaitingListWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [editingWaitingItem, setEditingWaitingItem] = useState<WaitingListWithDetails | null>(null);
  const [formData, setFormData] = useState<CreateWaitingList>({
    patient_id: 0,
    dentist_id: undefined,
    procedure_id: undefined,
    preferred_date: '',
    preferred_time_start: '',
    preferred_time_end: '',
    priority: 1,
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
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [waitingResponse, patientsResponse, professionalsResponse, proceduresResponse] = await Promise.all([
        fetch('/api/waiting-list'),
        fetch('/api/patients'),
        fetch('/api/professionals'),
        fetch('/api/procedures')
      ]);

      const [waitingData, patientsData, professionalsData, proceduresData] = await Promise.all([
        waitingResponse.json(),
        patientsResponse.json(),
        professionalsResponse.json(),
        proceduresResponse.ok ? proceduresResponse.json() : []
      ]);

      setWaitingList(waitingData);
      setPatients(patientsData);
      setProfessionals(professionalsData);
      setProcedures(proceduresData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailableSlots = async () => {
    try {
      const response = await fetch('/api/waiting-list/available-slots');
      const data = await response.json();
      setAvailableSlots(data);
    } catch (error) {
      console.error('Error checking available slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingWaitingItem ? `/api/waiting-list/${editingWaitingItem.id}` : '/api/waiting-list';
      const method = editingWaitingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchData();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving waiting list entry:', error);
    }
  };

  const openEditWaitingItem = (item: WaitingListWithDetails) => {
    setEditingWaitingItem(item);
    setFormData({
      patient_id: item.patient_id,
      dentist_id: item.dentist_id || undefined,
      procedure_id: item.procedure_id || undefined,
      preferred_date: item.preferred_date || '',
      preferred_time_start: item.preferred_time_start || '',
      preferred_time_end: item.preferred_time_end || '',
      priority: item.priority,
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleDeleteWaitingItem = async (waitingId: number) => {
    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente esta entrada da lista de espera e não pode ser desfeita. Tem certeza?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/waiting-list/${waitingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir entrada da lista de espera');
      }
    } catch (error) {
      console.error('Error deleting waiting list entry:', error);
      alert('Erro ao excluir entrada da lista de espera');
    }
  };

  const handleAutoSchedule = async (waitingId: number) => {
    try {
      const response = await fetch(`/api/waiting-list/${waitingId}/auto-schedule`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchData();
        alert('Paciente agendado automaticamente!');
      }
    } catch (error) {
      console.error('Error auto-scheduling:', error);
    }
  };

  const handleStatusUpdate = async (waitingId: number, status: string) => {
    try {
      const response = await fetch(`/api/waiting-list/${waitingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: 0,
      dentist_id: undefined,
      procedure_id: undefined,
      preferred_date: '',
      preferred_time_start: '',
      preferred_time_end: '',
      priority: 1,
      notes: ''
    });
    setEditingWaitingItem(null);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'text-error bg-error/10 border-error/30';
      case 4: return 'text-warning bg-warning/10 border-warning/30';
      case 3: return 'text-warning bg-warning/10 border-warning/30';
      case 2: return 'text-primary bg-primary/10 border-primary/30';
      default: return 'text-success bg-success/10 border-success/30';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Urgente';
      case 4: return 'Alta';
      case 3: return 'Média';
      case 2: return 'Baixa';
      default: return 'Normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-warning/20 text-warning';
      case 'scheduled': return 'bg-success/20 text-success';
      case 'cancelled': return 'bg-error/20 text-error';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'scheduled': return 'Agendado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredWaitingList = waitingList.filter(item => {
    const matchesSearch = item.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || item.priority.toString() === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
              <h2 className="text-2xl font-bold text-gray-900">Lista de Espera</h2>
              <p className="text-gray-600">Gerencie pacientes aguardando encaixe na agenda</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <PermissionGate requiredPermissions={[PERMISSIONS.WAITING_LIST_AUTO_SCHEDULE]}>
                <button
                  onClick={checkAvailableSlots}
                  className="btn-secondary px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Verificar Vagas</span>
                </button>
              </PermissionGate>
              <PermissionGate requiredPermissions={[PERMISSIONS.WAITING_LIST_MANAGE]}>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar à Lista</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos os status</option>
              <option value="waiting">Aguardando</option>
              <option value="scheduled">Agendado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as prioridades</option>
              <option value="5">Urgente</option>
              <option value="4">Alta</option>
              <option value="3">Média</option>
              <option value="2">Baixa</option>
              <option value="1">Normal</option>
            </select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{filteredWaitingList.length} pacientes</span>
            </div>
          </div>
        </div>

        {/* Available slots alert */}
        {availableSlots.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-emerald-800 font-medium">Vagas disponíveis encontradas!</h3>
                <p className="text-emerald-700 text-sm mt-1">
                  {availableSlots.length} horários disponíveis para encaixe automático
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Waiting list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando lista de espera...</p>
            </div>
          ) : filteredWaitingList.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredWaitingList.map((item) => (
                <div key={`waiting-list-entry-${item.id}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {item.patient_name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{item.patient_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                              <Star className="w-3 h-3 inline mr-1" />
                              {getPriorityLabel(item.priority)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {item.patient_phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{item.patient_phone}</span>
                              </div>
                            )}
                            
                            {item.professional_name && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>Profissional {item.professional_name}</span>
                              </div>
                            )}
                            
                            {item.procedure_name && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{item.procedure_name}</span>
                              </div>
                            )}
                          </div>

                          {(item.preferred_date || item.preferred_time_start) && (
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <div className="flex space-x-2">
                                {item.preferred_date && (
                                  <span>Data: {new Date(item.preferred_date).toLocaleDateString('pt-BR')}</span>
                                )}
                                {item.preferred_time_start && (
                                  <span>Horário: {item.preferred_time_start} - {item.preferred_time_end}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {item.notes && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Observações:</span> {item.notes}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {item.status === 'waiting' && (
                        <>
                          <PermissionGate requiredPermissions={[PERMISSIONS.WAITING_LIST_AUTO_SCHEDULE]}>
                            <button
                              onClick={() => handleAutoSchedule(item.id)}
                              className="p-2 text-success hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                              title="Agendar automaticamente"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate requiredPermissions={[PERMISSIONS.WAITING_LIST_MANAGE]}>
                            <button
                              onClick={() => openEditWaitingItem(item)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate requiredPermissions={[PERMISSIONS.WAITING_LIST_MANAGE]}>
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'cancelled')}
                              className="p-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                        </>
                      )}
                      <PermissionGate requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
                        <button
                          onClick={() => handleDeleteWaitingItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir permanentemente (apenas super admin)"
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
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'Nenhum paciente encontrado com os filtros aplicados'
                  : 'Nenhum paciente na lista de espera'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Adicionar primeiro paciente à lista
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingWaitingItem ? 'Editar Item da Lista de Espera' : 'Adicionar à Lista de Espera'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paciente *
                    </label>
                    <select
                      required
                      value={formData.patient_id}
                      onChange={(e) => setFormData({ ...formData, patient_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value={0}>Selecione um paciente</option>
                      {patients.map(patient => (
                        <option key={`waiting-list-modal-patient-${patient.id}`} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>Normal</option>
                      <option value={2}>Baixa</option>
                      <option value={3}>Média</option>
                      <option value={4}>Alta</option>
                      <option value={5}>Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional preferencial
                    </label>
                    <select
                      value={formData.dentist_id || ''}
                      onChange={(e) => setFormData({ ...formData, dentist_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Qualquer profissional</option>
                      {professionals.map(professional => (
                        <option key={`waiting-list-modal-professional-${professional.id}`} value={professional.id}>{professional.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Procedimento
                    </label>
                    <select
                      value={formData.procedure_id || ''}
                      onChange={(e) => setFormData({ ...formData, procedure_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um procedimento</option>
                      {procedures.map(procedure => (
                        <option key={`waiting-list-modal-procedure-${procedure.id}`} value={procedure.id}>{procedure.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data preferencial
                    </label>
                    <input
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário início
                      </label>
                      <input
                        type="time"
                        value={formData.preferred_time_start}
                        onChange={(e) => setFormData({ ...formData, preferred_time_start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário fim
                      </label>
                      <input
                        type="time"
                        value={formData.preferred_time_end}
                        onChange={(e) => setFormData({ ...formData, preferred_time_end: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Informações adicionais sobre as preferências do paciente..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
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
                    className="px-6 py-2 btn-primary rounded-lg transition-all duration-200"
                  >
                    {editingWaitingItem ? 'Atualizar' : 'Adicionar à Lista'}
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
