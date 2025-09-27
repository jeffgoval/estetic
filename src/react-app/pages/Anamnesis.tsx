import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { useToast } from '@/react-app/components/Toast';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  UserCheck,
  Send,
  Eye,
  Edit,
  Calendar,
  Stethoscope,
  Activity,
  TrendingUp,
  AlertCircle,
  Download,
  MessageSquare,
  Mail,
  ExternalLink
} from 'lucide-react';
import type { AnamnesisForm, AnamnesisTemplate, TreatmentProtocol } from '@/shared/types';
import { NewFormModal, NewTemplateModal, FormViewModal } from '@/react-app/components/AnamnesisModals';

export default function Anamnesis() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // State management
  const [activeTab, setActiveTab] = useState<'forms' | 'templates' | 'protocols' | 'analytics'>('forms');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Data states
  const [forms, setForms] = useState<AnamnesisForm[]>([]);
  const [templates, setTemplates] = useState<AnamnesisTemplate[]>([]);
  const [protocols, setProtocols] = useState<TreatmentProtocol[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Modal states
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<AnamnesisForm | null>(null);

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
      
      if (activeTab === 'forms') {
        const response = await fetch('/api/anamnesis/forms');
        const data = await response.json();
        setForms(data);
      } else if (activeTab === 'templates') {
        const response = await fetch('/api/anamnesis/templates');
        const data = await response.json();
        setTemplates(data);
      } else if (activeTab === 'protocols') {
        const response = await fetch('/api/anamnesis/protocols');
        const data = await response.json();
        setProtocols(data);
      } else if (activeTab === 'analytics') {
        const response = await fetch('/api/anamnesis/analytics');
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados', 'Tente novamente em alguns instantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await fetch('/api/anamnesis/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setTemplates(prev => [newTemplate, ...prev]);
        setShowNewTemplateModal(false);
        toast.success('Template criado!', 'Template de anamnese criado com sucesso.');
      } else {
        const error = await response.json();
        toast.error('Erro ao criar template', error.error || 'Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Erro de conexão', 'Verifique sua internet e tente novamente.');
    }
  };

  const handleCreateForm = async (formData: any) => {
    try {
      const response = await fetch('/api/anamnesis/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newForm = await response.json();
        setForms(prev => [newForm, ...prev]);
        setShowNewFormModal(false);
        toast.success('Formulário criado!', 'Link de anamnese gerado com sucesso.');
      } else {
        const error = await response.json();
        toast.error('Erro ao criar formulário', error.error || 'Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Erro de conexão', 'Verifique sua internet e tente novamente.');
    }
  };

  const handleSendForm = async (formId: number, method: 'email' | 'whatsapp') => {
    try {
      const response = await fetch(`/api/anamnesis/forms/${formId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });

      if (response.ok) {
        toast.success('Formulário enviado!', `Anamnese enviada via ${method === 'email' ? 'e-mail' : 'WhatsApp'}.`);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error('Erro ao enviar', error.error || 'Tente novamente.');
      }
    } catch (error) {
      console.error('Error sending form:', error);
      toast.error('Erro de conexão', 'Verifique sua internet e tente novamente.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Preenchido';
      case 'pending':
        return 'Pendente';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.template_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProtocols = protocols.filter(protocol =>
    protocol.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.protocol_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Anamnese Digital</h2>
                <p className="text-gray-600">Formulários e protocolos de tratamento</p>
              </div>
            </div>
            
            <PermissionGate requiredPermissions={[PERMISSIONS.PATIENT_CREATE]}>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNewTemplateModal(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Novo Template</span>
                </button>
                <button
                  onClick={() => setShowNewFormModal(true)}
                  className="btn-primary px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Anamnese</span>
                </button>
              </div>
            </PermissionGate>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'forms', label: 'Formulários', icon: FileText },
                { id: 'templates', label: 'Templates', icon: Edit },
                { id: 'protocols', label: 'Protocolos', icon: UserCheck },
                { id: 'analytics', label: 'Analytics', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'forms' ? 'Buscar por paciente ou template...' :
                  activeTab === 'templates' ? 'Buscar templates...' :
                  activeTab === 'protocols' ? 'Buscar por paciente ou protocolo...' :
                  'Buscar...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {activeTab === 'forms' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="completed">Preenchido</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Forms Tab */}
              {activeTab === 'forms' && (
                <div>
                  {filteredForms.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredForms.map((form) => (
                        <div key={form.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {form.patient_name?.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{form.patient_name}</h3>
                                  <p className="text-sm text-gray-500">{form.template_name}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(form.status)}
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(form.status)}`}>
                                    {getStatusText(form.status)}
                                  </span>
                                </div>
                                
                                {form.appointment_date && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(form.appointment_date).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                )}

                                {form.alerts_detected && (() => {
                                  try {
                                    const alerts = JSON.parse(form.alerts_detected);
                                    return alerts.length > 0 && (
                                      <div className="flex items-center space-x-2 text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{alerts.length} alerta(s)</span>
                                      </div>
                                    );
                                  } catch (e) {
                                    return null;
                                  }
                                })()}

                                {form.sent_at && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Send className="w-4 h-4" />
                                    <span>Enviado em {new Date(form.sent_at).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {form.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleSendForm(form.id, 'email')}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Enviar por e-mail"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleSendForm(form.id, 'whatsapp')}
                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Enviar por WhatsApp"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => window.open(`/anamnesis/${form.form_token}`, '_blank')}
                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Abrir formulário"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {form.status === 'completed' && (
                                <button
                                  onClick={() => setSelectedForm(form)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Visualizar respostas"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Nenhum formulário encontrado' 
                          : 'Nenhum formulário de anamnese criado'
                        }
                      </p>
                      {!searchTerm && statusFilter === 'all' && (
                        <PermissionGate requiredPermissions={[PERMISSIONS.PATIENT_CREATE]}>
                          <button
                            onClick={() => setShowNewFormModal(true)}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Criar primeiro formulário
                          </button>
                        </PermissionGate>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div>
                  {filteredTemplates.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredTemplates.map((template) => (
                        <div key={template.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                  {template.description && (
                                    <p className="text-sm text-gray-500">{template.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 mt-3">
                                {template.is_default && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                    Padrão
                                  </span>
                                )}
                                <span className="text-sm text-gray-600">
                                  {(() => {
                                    try {
                                      return JSON.parse(template.sections).length;
                                    } catch (e) {
                                      return 0;
                                    }
                                  })()} seção(ões)
                                </span>
                                {template.created_by_name && (
                                  <span className="text-sm text-gray-600">
                                    Criado por {template.created_by_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar template"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Usar template"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template de anamnese criado'}
                      </p>
                      {!searchTerm && (
                        <PermissionGate requiredPermissions={[PERMISSIONS.PATIENT_CREATE]}>
                          <button
                            onClick={() => setShowNewTemplateModal(true)}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Criar primeiro template
                          </button>
                        </PermissionGate>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Protocols Tab */}
              {activeTab === 'protocols' && (
                <div>
                  {filteredProtocols.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredProtocols.map((protocol) => (
                        <div key={protocol.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{protocol.protocol_title}</h3>
                                  <p className="text-sm text-gray-500">Paciente: {protocol.patient_name}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    protocol.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    protocol.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                    protocol.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {protocol.status === 'completed' ? 'Concluído' :
                                     protocol.status === 'approved' ? 'Aprovado' :
                                     protocol.status === 'ready' ? 'Pronto' : 'Rascunho'}
                                  </span>
                                </div>
                                
                                {protocol.professional_name && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{protocol.professional_name}</span>
                                  </div>
                                )}

                                {protocol.appointment_date && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(protocol.appointment_date).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                )}

                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(protocol.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Visualizar protocolo"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <PermissionGate requiredPermissions={[PERMISSIONS.PATIENT_UPDATE]}>
                                <button
                                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Editar protocolo"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </PermissionGate>
                              <button
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Baixar protocolo"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm ? 'Nenhum protocolo encontrado' : 'Nenhum protocolo de tratamento criado'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && analytics && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total de Formulários</p>
                          <p className="text-2xl font-bold text-blue-900">{analytics.total_forms}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Taxa de Conclusão</p>
                          <p className="text-2xl font-bold text-green-900">{analytics.completion_rate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Tempo Médio</p>
                          <p className="text-2xl font-bold text-purple-900">{analytics.avg_completion_time_minutes}min</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-600 text-sm font-medium">Com Alertas</p>
                          <p className="text-2xl font-bold text-red-900">{analytics.forms_with_alerts}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Forms Table */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Formulários Recentes</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Paciente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Alertas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.recent_forms.map((form: any) => (
                            <tr key={form.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {form.patient_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(form.status)}`}>
                                  {getStatusText(form.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {form.alerts_count > 0 ? (
                                  <span className="text-red-600 font-medium">{form.alerts_count} alerta(s)</span>
                                ) : (
                                  <span className="text-green-600">Nenhum</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(form.created_at).toLocaleDateString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewFormModal 
        isOpen={showNewFormModal}
        onClose={() => setShowNewFormModal(false)}
        onSubmit={handleCreateForm}
      />
      
      <NewTemplateModal 
        isOpen={showNewTemplateModal}
        onClose={() => setShowNewTemplateModal(false)}
        onSubmit={handleCreateTemplate}
      />
      
      {selectedForm && (
        <FormViewModal 
          isOpen={!!selectedForm}
          onClose={() => setSelectedForm(null)}
          form={selectedForm}
        />
      )}
    </Layout>
  );
}
