import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  Bot, 
  Plus, 
  Settings, 
  Send,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Brain,
  Eye,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Activity,
  BarChart3,
  Filter,
  Search,
  Download,
  RefreshCw,
  Star,
  Phone
} from 'lucide-react';

interface AILead {
  id: number;
  name?: string;
  phone: string;
  email?: string;
  source: string;
  status: string;
  interest_level: number;
  conversation_stage: string;
  last_interaction_at: string;
  notes?: string;
  is_patient: boolean;
}

interface AIConversation {
  id: number;
  lead_id: number;
  message: string;
  sender: string;
  ai_response: boolean;
  intent_detected?: string;
  confidence_score?: number;
  created_at: string;
}

interface AIIntent {
  id: number;
  name: string;
  description?: string;
  keywords?: string;
  response_template?: string;
  follow_up_action?: string;
  is_active: boolean;
}

interface AISalesFunnel {
  id: number;
  name: string;
  description?: string;
  stages: string;
  automation_rules?: string;
  is_active: boolean;
}

interface AIAnalytics {
  leads_today: number;
  leads_this_week: number;
  conversion_rate: number;
  avg_response_time: number;
  total_conversations: number;
  active_conversations: number;
}

export default function AIAgent() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [leads, setLeads] = useState<AILead[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [intents, setIntents] = useState<AIIntent[]>([]);
  const [funnels, setFunnels] = useState<AISalesFunnel[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    leads_today: 0,
    leads_this_week: 0,
    conversion_rate: 0,
    avg_response_time: 0,
    total_conversations: 0,
    active_conversations: 0
  });

  const [selectedLead, setSelectedLead] = useState<AILead | null>(null);
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [editingIntent, setEditingIntent] = useState<AIIntent | null>(null);
  const [editingFunnel, setEditingFunnel] = useState<AISalesFunnel | null>(null);
  
  const [newIntent, setNewIntent] = useState({
    name: '',
    description: '',
    keywords: '',
    response_template: '',
    follow_up_action: ''
  });

  const [newFunnel, setNewFunnel] = useState({
    name: '',
    description: '',
    stages: '',
    automation_rules: ''
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      loadAIData();
    }
  }, [user]);

  const loadAIData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLeads(),
        loadConversations(),
        loadIntents(),
        loadFunnels(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await fetch('/api/ai/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/ai/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadIntents = async () => {
    try {
      const response = await fetch('/api/ai/intents');
      if (response.ok) {
        const data = await response.json();
        setIntents(data);
      }
    } catch (error) {
      console.error('Error loading intents:', error);
    }
  };

  const loadFunnels = async () => {
    try {
      const response = await fetch('/api/ai/funnels');
      if (response.ok) {
        const data = await response.json();
        setFunnels(data);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/ai/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const saveIntent = async () => {
    try {
      const url = editingIntent 
        ? `/api/ai/intents/${editingIntent.id}`
        : '/api/ai/intents';
      
      const method = editingIntent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntent)
      });

      if (response.ok) {
        await loadIntents();
        setShowIntentModal(false);
        resetIntentForm();
      }
    } catch (error) {
      console.error('Error saving intent:', error);
    }
  };

  const saveFunnel = async () => {
    try {
      const url = editingFunnel 
        ? `/api/ai/funnels/${editingFunnel.id}`
        : '/api/ai/funnels';
      
      const method = editingFunnel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFunnel)
      });

      if (response.ok) {
        await loadFunnels();
        setShowFunnelModal(false);
        resetFunnelForm();
      }
    } catch (error) {
      console.error('Error saving funnel:', error);
    }
  };

  const resetIntentForm = () => {
    setNewIntent({ name: '', description: '', keywords: '', response_template: '', follow_up_action: '' });
    setEditingIntent(null);
  };

  const resetFunnelForm = () => {
    setNewFunnel({ name: '', description: '', stages: '', automation_rules: '' });
    setEditingFunnel(null);
  };

  const openEditIntent = (intent: AIIntent) => {
    setEditingIntent(intent);
    setNewIntent({
      name: intent.name,
      description: intent.description || '',
      keywords: intent.keywords || '',
      response_template: intent.response_template || '',
      follow_up_action: intent.follow_up_action || ''
    });
    setShowIntentModal(true);
  };

  const openEditFunnel = (funnel: AISalesFunnel) => {
    setEditingFunnel(funnel);
    setNewFunnel({
      name: funnel.name,
      description: funnel.description || '',
      stages: funnel.stages,
      automation_rules: funnel.automation_rules || ''
    });
    setShowFunnelModal(true);
  };

  const handleDeactivateIntent = async (intentId: number) => {
    if (!confirm('Tem certeza que deseja desativar esta intenção?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ai/intents/${intentId}/deactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadIntents();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao desativar intenção');
      }
    } catch (error) {
      console.error('Error deactivating intent:', error);
      alert('Erro ao desativar intenção');
    }
  };

  const handleDeleteIntent = async (intentId: number) => {
    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente esta intenção e não pode ser desfeita. Tem certeza?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ai/intents/${intentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadIntents();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir intenção');
      }
    } catch (error) {
      console.error('Error deleting intent:', error);
      alert('Erro ao excluir intenção');
    }
  };

  const handleDeactivateFunnel = async (funnelId: number) => {
    if (!confirm('Tem certeza que deseja desativar este funil?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ai/funnels/${funnelId}/deactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadFunnels();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao desativar funil');
      }
    } catch (error) {
      console.error('Error deactivating funnel:', error);
      alert('Erro ao desativar funil');
    }
  };

  const handleDeleteFunnel = async (funnelId: number) => {
    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente este funil e não pode ser desfeita. Tem certeza?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ai/funnels/${funnelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFunnels();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir funil');
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
      alert('Erro ao excluir funil');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestStars = (level: number, identifier: string = '') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={`star-${level}-${i}-${identifier}`}
        className={`w-4 h-4 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'conversations', name: 'Conversas', icon: MessageSquare },
    { id: 'intents', name: 'Intenções', icon: Brain },
    { id: 'funnels', name: 'Funis de Venda', icon: Target },
    { id: 'training', name: 'Treinamento IA', icon: Bot },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

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
        <div className="bg-gradient-primary rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Agente de IA</h2>
              <p className="text-white/80">
                Captura de leads e conversão automática para tratamentos estéticos
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Status do Agente IA</h3>
                <p className="text-sm text-gray-600">
                  Ativo e processando conversas em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-primary px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Treinar IA</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-primary text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      style={activeTab === tab.id ? {
                        boxShadow: '0 10px 25px rgba(var(--color-primary-rgb), 0.25)'
                      } : {}}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando dados do agente IA...</p>
                </div>
              ) : (
                <>
                  {/* Dashboard */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Dashboard do Agente IA</h3>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Leads Hoje</p>
                              <p className="text-2xl font-bold text-blue-900">{analytics.leads_today}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-emerald-600">Taxa de Conversão</p>
                              <p className="text-2xl font-bold text-emerald-900">{analytics.conversion_rate}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-emerald-600" />
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-600">Conversas Ativas</p>
                              <p className="text-2xl font-bold text-purple-900">{analytics.active_conversations}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Atividade Recente</h4>
                        <div className="space-y-3">
                          {leads.slice(0, 5).map((lead) => (
                            <div key={`dashboard-lead-${lead.id}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {lead.name || lead.phone}
                                  </p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                    {lead.status === 'new' ? 'Novo' :
                                     lead.status === 'contacted' ? 'Contatado' :
                                     lead.status === 'qualified' ? 'Qualificado' :
                                     lead.status === 'converted' ? 'Convertido' : 'Perdido'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Estágio: {lead.conversation_stage}
                                </p>
                                <div className="flex items-center space-x-1 mt-1">
                                  {getInterestStars(lead.interest_level, `dashboard-${lead.id}`)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Leads */}
                  {activeTab === 'leads' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Gerenciamento de Leads</h3>
                        <div className="flex space-x-2">
                          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                            <Filter className="w-4 h-4" />
                            <span>Filtrar</span>
                          </button>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Exportar</span>
                          </button>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Pesquisar leads..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      {/* Leads Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lead
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contato
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Interesse
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Última Interação
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map((lead) => (
                              <tr key={`leads-table-${lead.id}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {lead.name || 'Nome não informado'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {lead.source === 'whatsapp' ? 'WhatsApp' : lead.source}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{lead.phone}</div>
                                  {lead.email && (
                                    <div className="text-sm text-gray-500">{lead.email}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                    {lead.status === 'new' ? 'Novo' :
                                     lead.status === 'contacted' ? 'Contatado' :
                                     lead.status === 'qualified' ? 'Qualificado' :
                                     lead.status === 'converted' ? 'Convertido' : 'Perdido'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-1">
                                    {getInterestStars(lead.interest_level, `leads-table-${lead.id}`)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(lead.last_interaction_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => setSelectedLead(lead)}
                                      className="text-purple-600 hover:text-purple-900"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="text-blue-600 hover:text-blue-900">
                                      <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="text-emerald-600 hover:text-emerald-900">
                                      <MessageSquare className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Conversations */}
                  {activeTab === 'conversations' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Conversas com IA</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Conversation List */}
                        <div className="lg:col-span-1 border-r border-gray-200 pr-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Conversas Ativas</h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {leads.slice(0, 10).map((lead) => (
                              <div
                                key={`conversation-lead-${lead.id}`}
                                onClick={() => setSelectedLead(lead)}
                                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {lead.name || lead.phone}
                                    </p>
                                    <p className="text-xs text-gray-500">{lead.conversation_stage}</p>
                                  </div>
                                  <div className={`w-2 h-2 rounded-full ${
                                    lead.status === 'new' ? 'bg-blue-500' : 
                                    lead.status === 'contacted' ? 'bg-yellow-500' : 'bg-emerald-500'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chat Area */}
                        <div className="lg:col-span-2">
                          {selectedLead ? (
                            <div className="flex flex-col h-96">
                              <div className="border-b border-gray-200 pb-3 mb-3">
                                <h4 className="text-md font-medium text-gray-900">
                                  {selectedLead.name || selectedLead.phone}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Status: {selectedLead.status} • Estágio: {selectedLead.conversation_stage}
                                </p>
                              </div>
                              
                              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                                <div className="space-y-3">
                                  {conversations
                                    .filter(conv => conv.lead_id === selectedLead.id)
                                    .map((conv) => (
                                      <div
                                        key={`conversation-${conv.id}`}
                                        className={`flex ${conv.sender === 'lead' ? 'justify-start' : 'justify-end'}`}
                                      >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                          conv.sender === 'lead'
                                            ? 'bg-white text-gray-900'
                                            : conv.ai_response
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-blue-600 text-white'
                                        }`}>
                                          <p className="text-sm">{conv.message}</p>
                                          {conv.intent_detected && (
                                            <p className="text-xs mt-1 opacity-75">
                                              Intenção: {conv.intent_detected}
                                            </p>
                                          )}
                                          <p className="text-xs mt-1 opacity-75">
                                            {new Date(conv.created_at).toLocaleTimeString('pt-BR')}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                              
                              <div className="mt-4 flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Digite uma mensagem..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-96 text-gray-500">
                              <div className="text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Selecione uma conversa para visualizar</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Intents */}
                  {activeTab === 'intents' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Intenções do Cliente</h3>
                        <PermissionGate requiredPermissions={[PERMISSIONS.AI_INTENTS_MANAGE]}>
                          <button
                            onClick={() => setShowIntentModal(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Nova Intenção</span>
                          </button>
                        </PermissionGate>
                      </div>

                      <div className="grid gap-4">
                        {intents.map((intent) => (
                          <div key={`intent-${intent.id}`} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="text-sm font-medium text-gray-900">{intent.name}</h5>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    intent.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {intent.is_active ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>
                                {intent.description && (
                                  <p className="text-sm text-gray-600 mb-3">{intent.description}</p>
                                )}
                                {intent.keywords && (
                                  <div className="mb-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Palavras-chave:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {intent.keywords.split(',').map((keyword, i) => (
                                        <span key={`intent-${intent.id}-keyword-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                          {keyword.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {intent.response_template && (
                                  <div className="bg-gray-50 rounded p-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Template de Resposta:</p>
                                    <p className="text-sm text-gray-700">{intent.response_template}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <PermissionGate requiredPermissions={[PERMISSIONS.AI_INTENTS_MANAGE]}>
                                  <button
                                    onClick={() => openEditIntent(intent)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar intenção"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </PermissionGate>
                                {intent.is_active ? (
                                  <PermissionGate requiredPermissions={[PERMISSIONS.AI_INTENTS_MANAGE]}>
                                    <button
                                      onClick={() => handleDeactivateIntent(intent.id)}
                                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                      title="Desativar intenção"
                                    >
                                      <AlertCircle className="w-4 h-4" />
                                    </button>
                                  </PermissionGate>
                                ) : null}
                                <PermissionGate requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
                                  <button
                                    onClick={() => handleDeleteIntent(intent.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    </div>
                  )}

                  {/* Funnels */}
                  {activeTab === 'funnels' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Funis de Venda</h3>
                        <PermissionGate requiredPermissions={[PERMISSIONS.AI_FUNNELS_MANAGE]}>
                          <button
                            onClick={() => setShowFunnelModal(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Novo Funil</span>
                          </button>
                        </PermissionGate>
                      </div>

                      <div className="grid gap-6">
                        {funnels.map((funnel) => (
                          <div key={`funnel-${funnel.id}`} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h5 className="text-lg font-medium text-gray-900">{funnel.name}</h5>
                                {funnel.description && (
                                  <p className="text-sm text-gray-600 mt-1">{funnel.description}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <PermissionGate requiredPermissions={[PERMISSIONS.AI_FUNNELS_MANAGE]}>
                                  <button
                                    onClick={() => openEditFunnel(funnel)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar funil"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </PermissionGate>
                                {funnel.is_active ? (
                                  <PermissionGate requiredPermissions={[PERMISSIONS.AI_FUNNELS_MANAGE]}>
                                    <button
                                      onClick={() => handleDeactivateFunnel(funnel.id)}
                                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                      title="Desativar funil"
                                    >
                                      <AlertCircle className="w-4 h-4" />
                                    </button>
                                  </PermissionGate>
                                ) : null}
                                <PermissionGate requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
                                  <button
                                    onClick={() => handleDeleteFunnel(funnel.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Excluir permanentemente (apenas super admin)"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </PermissionGate>
                              </div>
                            </div>
                            
                            {/* Funnel Stages */}
                            <div className="space-y-3">
                              <h6 className="text-sm font-medium text-gray-700">Estágios do Funil:</h6>
                              <div className="flex flex-wrap gap-2">
                                {JSON.parse(funnel.stages || '[]').map((stage: string, i: number) => (
                                  <div key={`funnel-${funnel.id}-stage-${i}`} className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                                      {i + 1}
                                    </div>
                                    <span className="text-sm text-gray-700">{stage}</span>
                                    {i < JSON.parse(funnel.stages || '[]').length - 1 && (
                                      <div className="w-4 h-px bg-gray-300"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Training */}
                  {activeTab === 'training' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Treinamento da IA</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Training Data */}
                        <div className="border border-gray-200 rounded-xl p-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Dados de Treinamento</h4>
                          
                          <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-blue-900">Conversas Analisadas</h5>
                                  <p className="text-xs text-blue-700">{analytics.total_conversations} conversas processadas</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-emerald-50 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <Brain className="w-5 h-5 text-emerald-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-emerald-900">Intenções Detectadas</h5>
                                  <p className="text-xs text-emerald-700">{intents.length} tipos de intenção configurados</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <Target className="w-5 h-5 text-purple-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-purple-900">Precisão da IA</h5>
                                  <p className="text-xs text-purple-700">87% de precisão nas respostas</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Training Actions */}
                        <div className="border border-gray-200 rounded-xl p-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Ações de Treinamento</h4>
                          
                          <div className="space-y-3">
                            <button className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <RefreshCw className="w-5 h-5 text-purple-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">Retreinar Modelo</h5>
                                  <p className="text-xs text-gray-600">Atualizar com novas conversas</p>
                                </div>
                              </div>
                            </button>
                            
                            <button className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <Download className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">Importar Dados</h5>
                                  <p className="text-xs text-gray-600">Carregar conversas externas</p>
                                </div>
                              </div>
                            </button>
                            
                            <button className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <Settings className="w-5 h-5 text-emerald-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">Configurar Parâmetros</h5>
                                  <p className="text-xs text-gray-600">Ajustar sensibilidade da IA</p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Analytics do Agente IA</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-sm">Leads Esta Semana</p>
                              <p className="text-2xl font-bold">{analytics.leads_this_week}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-200" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-emerald-100 text-sm">Taxa de Conversão</p>
                              <p className="text-2xl font-bold">{analytics.conversion_rate}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-emerald-200" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-100 text-sm">Tempo Médio de Resposta</p>
                              <p className="text-2xl font-bold">{analytics.avg_response_time}s</p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-200" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-100 text-sm">Total de Conversas</p>
                              <p className="text-2xl font-bold">{analytics.total_conversations}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-orange-200" />
                          </div>
                        </div>
                      </div>

                      {/* Charts placeholder */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Conversões por Período</h4>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Gráfico de conversões</p>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Distribuição de Leads por Fonte</h4>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Gráfico de distribuição</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Intent Modal */}
        {showIntentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingIntent ? 'Editar Intenção' : 'Nova Intenção'}
                </h3>
                <button
                  onClick={() => {
                    setShowIntentModal(false);
                    resetIntentForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da intenção
                  </label>
                  <input
                    type="text"
                    value={newIntent.name}
                    onChange={(e) => setNewIntent({ ...newIntent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: Interesse em Botox e Preenchimento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={newIntent.description}
                    onChange={(e) => setNewIntent({ ...newIntent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: Cliente interessado em procedimentos estéticos faciais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palavras-chave (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={newIntent.keywords}
                    onChange={(e) => setNewIntent({ ...newIntent, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="botox, preenchimento, harmonização, rejuvenescimento, rugas, limpeza de pele, tratamento facial, estética"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template de resposta
                  </label>
                  <textarea
                    rows={4}
                    value={newIntent.response_template}
                    onChange={(e) => setNewIntent({ ...newIntent, response_template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Olá! Ficamos felizes com seu interesse em nossos tratamentos estéticos! Para qual procedimento você gostaria de agendar uma avaliação gratuita?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ação de follow-up
                  </label>
                  <select
                    value={newIntent.follow_up_action}
                    onChange={(e) => setNewIntent({ ...newIntent, follow_up_action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Nenhuma ação</option>
                    <option value="schedule_appointment">Agendar consulta estética</option>
                    <option value="send_info">Enviar informações sobre tratamentos</option>
                    <option value="send_portfolio">Enviar galeria de antes e depois</option>
                    <option value="transfer_to_agent">Transferir para especialista em estética</option>
                    <option value="schedule_consultation">Agendar avaliação facial gratuita</option>
                    <option value="add_to_waitlist">Adicionar à lista de interessados</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowIntentModal(false);
                      resetIntentForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveIntent}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingIntent ? 'Atualizar' : 'Criar'} Intenção
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Funnel Modal */}
        {showFunnelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingFunnel ? 'Editar Funil' : 'Novo Funil de Venda'}
                </h3>
                <button
                  onClick={() => {
                    setShowFunnelModal(false);
                    resetFunnelForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do funil
                  </label>
                  <input
                    type="text"
                    value={newFunnel.name}
                    onChange={(e) => setNewFunnel({ ...newFunnel, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: Funil de Tratamentos Faciais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={newFunnel.description}
                    onChange={(e) => setNewFunnel({ ...newFunnel, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: Funil para conversão de leads interessados em tratamentos estéticos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estágios do funil (JSON)
                  </label>
                  <textarea
                    rows={4}
                    value={newFunnel.stages}
                    onChange={(e) => setNewFunnel({ ...newFunnel, stages: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder='["Primeiro contato", "Interesse em estética", "Avaliação facial gratuita", "Proposta personalizada", "Agendamento do tratamento"]'
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use formato JSON com array de strings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regras de automação (JSON)
                  </label>
                  <textarea
                    rows={6}
                    value={newFunnel.automation_rules}
                    onChange={(e) => setNewFunnel({ ...newFunnel, automation_rules: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder='{"stage_1": {"action": "send_welcome", "delay": 0}, "stage_2": {"action": "send_portfolio", "delay": 300}, "stage_3": {"action": "offer_free_aesthetic_evaluation", "delay": 600}}'
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Configure as ações automáticas para cada estágio
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowFunnelModal(false);
                      resetFunnelForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveFunnel}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingFunnel ? 'Atualizar' : 'Criar'} Funil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
