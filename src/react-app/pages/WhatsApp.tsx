import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Send,
  Phone,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Bot,
  Zap,
  Download,
  Copy,
  QrCode,
  Smartphone,
  Edit,
  Trash2
} from 'lucide-react';

interface WhatsAppConfig {
  api_token: string;
  phone_number: string;
  webhook_url: string;
  is_connected: boolean;
  auto_responses_enabled: boolean;
  appointment_booking_enabled: boolean;
}

interface MessageTemplate {
  id: number;
  name: string;
  message: string;
  type: 'reminder' | 'confirmation' | 'welcome' | 'custom';
  is_active: boolean;
  variables: string[];
}

interface WhatsAppContact {
  id: number;
  phone: string;
  name: string;
  last_message_at: string;
  status: 'active' | 'blocked';
  is_patient: boolean;
  patient_id?: number;
}

interface WhatsAppMessage {
  id: number;
  contact_phone: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  message_type: 'text' | 'template' | 'automated';
}

export default function WhatsApp() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<WhatsAppConfig>({
    api_token: '',
    phone_number: '',
    webhook_url: '',
    is_connected: false,
    auto_responses_enabled: true,
    appointment_booking_enabled: true
  });
  
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    message: '',
    type: 'custom' as 'reminder' | 'confirmation' | 'welcome' | 'custom'
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      loadWhatsAppData();
    }
  }, [user]);

  const loadWhatsAppData = async () => {
    try {
      setLoading(true);
      // Load configuration, templates, contacts, and messages
      await Promise.all([
        loadConfig(),
        loadTemplates(),
        loadContacts(),
        loadMessages()
      ]);
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/whatsapp/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        await loadConfig();
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const saveTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        variables: extractVariables(newTemplate.message)
      };

      const url = editingTemplate 
        ? `/api/whatsapp/templates/${editingTemplate.id}`
        : '/api/whatsapp/templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        await loadTemplates();
        setShowTemplateModal(false);
        resetTemplateForm();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const extractVariables = (message: string): string[] => {
    const matches = message.match(/\{(\w+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const resetTemplateForm = () => {
    setNewTemplate({ name: '', message: '', type: 'custom' });
    setEditingTemplate(null);
  };

  const openEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      message: template.message,
      type: template.type
    });
    setShowTemplateModal(true);
  };

  const handleDeactivateTemplate = async (templateId: number) => {
    if (!confirm('Tem certeza que deseja desativar este template?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/whatsapp/templates/${templateId}/deactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadTemplates();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao desativar template');
      }
    } catch (error) {
      console.error('Error deactivating template:', error);
      alert('Erro ao desativar template');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente este template e não pode ser desfeita. Tem certeza?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/whatsapp/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadTemplates();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erro ao excluir template');
    }
  };

  const defaultTemplates = [
    {
      name: 'Lembrete de Consulta',
      message: 'Olá {nome}! Lembre-se da sua consulta amanhã às {horario} com {profissional}. Confirme sua presença respondendo SIM.',
      type: 'reminder' as const
    },
    {
      name: 'Confirmação de Agendamento',
      message: 'Olá {nome}! Sua consulta foi agendada para {data} às {horario} com {profissional}. Em caso de dúvidas, entre em contato.',
      type: 'confirmation' as const
    },
    {
      name: 'Boas-vindas',
      message: 'Olá! Bem-vindo(a) ao {clinica}! Para agendar uma avaliação, digite AGENDAR. Para falar com nossa equipe, digite ATENDIMENTO.',
      type: 'welcome' as const
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'read': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: MessageSquare },
    { id: 'messages', name: 'Mensagens', icon: Send },
    { id: 'templates', name: 'Templates', icon: Bot },
    { id: 'contacts', name: 'Contatos', icon: User },
    { id: 'automation', name: 'Automação', icon: Zap },
    { id: 'config', name: 'Configuração', icon: Settings }
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">WhatsApp Business</h2>
              <p className="text-green-100">
                Gerencie notificações e agendamentos via WhatsApp
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${config.is_connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Status da Conexão
                </h3>
                <p className="text-sm text-gray-600">
                  {config.is_connected ? 'Conectado e funcionando' : 'Desconectado - Configure sua integração'}
                </p>
              </div>
            </div>
            {!config.is_connected && (
              <button
                onClick={() => setActiveTab('config')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Configurar
              </button>
            )}
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
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando dados do WhatsApp...</p>
                </div>
              ) : (
                <>
                  {/* Dashboard */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Dashboard WhatsApp</h3>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-emerald-600">Mensagens Hoje</p>
                              <p className="text-2xl font-bold text-emerald-900">{messages.length}</p>
                            </div>
                            <Send className="w-8 h-8 text-emerald-600" />
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Contatos Ativos</p>
                              <p className="text-2xl font-bold text-blue-900">{contacts.length}</p>
                            </div>
                            <User className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-600">Templates Ativos</p>
                              <p className="text-2xl font-bold text-orange-900">{templates.length}</p>
                            </div>
                            <Bot className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                      </div>

                      {/* Recent Messages */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Mensagens Recentes</h4>
                        <div className="space-y-3">
                          {messages.slice(0, 5).map((message) => (
                            <div key={`whatsapp-recent-message-${message.id}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                message.direction === 'incoming' ? 'bg-blue-100' : 'bg-emerald-100'
                              }`}>
                                {message.direction === 'incoming' ? (
                                  <Phone className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Send className="w-4 h-4 text-emerald-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">{message.contact_phone}</p>
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(message.status)}
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.sent_at).toLocaleTimeString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {activeTab === 'messages' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Conversas</h3>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Nova Mensagem</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                        {/* Contacts List */}
                        <div className="border-r border-gray-200 pr-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Contatos</h4>
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {contacts.map((contact) => (
                              <div key={`whatsapp-message-contact-${contact.id}`} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                    <p className="text-xs text-gray-500">{contact.phone}</p>
                                  </div>
                                  <div className={`w-2 h-2 rounded-full ${
                                    contact.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chat Area */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-col h-full">
                            <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                              <div className="text-center text-gray-500 text-sm">
                                Selecione um contato para visualizar a conversa
                              </div>
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <input
                                type="text"
                                placeholder="Digite sua mensagem..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Templates */}
                  {activeTab === 'templates' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Templates de Mensagem</h3>
                        <PermissionGate requiredPermissions={[PERMISSIONS.WHATSAPP_TEMPLATES]}>
                          <button
                            onClick={() => setShowTemplateModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Novo Template</span>
                          </button>
                        </PermissionGate>
                      </div>

                      {/* Default Templates */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-900">Templates Padrão</h4>
                        <div className="grid gap-4">
                          {defaultTemplates.map((template, defaultIndex) => (
                            <div key={`whatsapp-default-template-${defaultIndex}-${template.name}`} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      template.type === 'reminder' ? 'bg-blue-100 text-blue-800' :
                                      template.type === 'confirmation' ? 'bg-emerald-100 text-emerald-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {template.type === 'reminder' ? 'Lembrete' :
                                       template.type === 'confirmation' ? 'Confirmação' : 'Personalizado'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {extractVariables(template.message).map((variable, varIndex) => (
                                      <span key={`whatsapp-default-var-${defaultIndex}-${varIndex}`} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                        {variable}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Templates */}
                      {templates.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-md font-semibold text-gray-900">Templates Personalizados</h4>
                          <div className="grid gap-4">
                            {templates.map((template) => (
                              <div key={`whatsapp-custom-template-${template.id}`} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        template.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {template.is_active ? 'Ativo' : 'Inativo'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {template.variables.map((variable, customVarIndex) => (
                                        <span key={`whatsapp-custom-var-${template.id}-${customVarIndex}`} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                          {variable}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 ml-4">
                                    <PermissionGate requiredPermissions={[PERMISSIONS.WHATSAPP_TEMPLATES]}>
                                      <button
                                        onClick={() => openEditTemplate(template)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar template"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </PermissionGate>
                                    {template.is_active ? (
                                      <PermissionGate requiredPermissions={[PERMISSIONS.WHATSAPP_TEMPLATES]}>
                                        <button
                                          onClick={() => handleDeactivateTemplate(template.id)}
                                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                          title="Desativar template"
                                        >
                                          <AlertCircle className="w-4 h-4" />
                                        </button>
                                      </PermissionGate>
                                    ) : null}
                                    <PermissionGate requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
                                      <button
                                        onClick={() => handleDeleteTemplate(template.id)}
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
                    </div>
                  )}

                  {/* Contacts */}
                  {activeTab === 'contacts' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Contatos WhatsApp</h3>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Exportar Contatos</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contato
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telefone
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Última Mensagem
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paciente
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {contacts.map((contact) => (
                              <tr key={`whatsapp-contact-table-${contact.id}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {contact.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(contact.last_message_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    contact.status === 'active' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {contact.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {contact.is_patient ? '✓ Sim' : '✗ Não'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Automation */}
                  {activeTab === 'automation' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Automação WhatsApp</h3>
                      
                      <div className="grid gap-6">
                        {/* Auto Responses */}
                        <div className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">Respostas Automáticas</h4>
                              <p className="text-sm text-gray-600">Responder automaticamente a mensagens recebidas</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.auto_responses_enabled}
                                onChange={(e) => setConfig({ ...config, auto_responses_enabled: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Palavras-chave para agendamento:</h5>
                              <div className="flex flex-wrap gap-2">
                                {['AGENDAR', 'CONSULTA', 'HORARIO', 'MARCAR'].map((keyword) => (
                                  <span key={keyword} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Resposta automática:</h5>
                              <p className="text-sm text-gray-600">
                                "Olá! Para agendar uma consulta, acesse nosso link: [LINK]. 
                                Para falar com nossa equipe, aguarde que logo mais alguém irá te atender!"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Appointment Booking */}
                        <div className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">Agendamento via WhatsApp</h4>
                              <p className="text-sm text-gray-600">Permitir agendamentos diretamente pelo WhatsApp</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.appointment_booking_enabled}
                                onChange={(e) => setConfig({ ...config, appointment_booking_enabled: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-blue-900">Horários disponíveis</h5>
                                  <p className="text-xs text-blue-700">Mostra automaticamente horários livres</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <div>
                                  <h5 className="text-sm font-medium text-emerald-900">Confirmação automática</h5>
                                  <p className="text-xs text-emerald-700">Envia confirmação após agendamento</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reminders */}
                        <div className="border border-gray-200 rounded-xl p-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">Lembretes Automáticos</h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Lembrete 24h antes</h5>
                                <p className="text-sm text-gray-600">Enviar lembrete um dia antes da consulta</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Lembrete 2h antes</h5>
                                <p className="text-sm text-gray-600">Enviar lembrete duas horas antes da consulta</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configuration */}
                  {activeTab === 'config' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Configuração WhatsApp</h3>
                      
                      {!config.is_connected ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <Smartphone className="w-8 h-8 text-blue-600" />
                            <div>
                              <h4 className="text-lg font-medium text-blue-900">Conectar WhatsApp Business</h4>
                              <p className="text-sm text-blue-700">Configure sua integração com WhatsApp Business API</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Token da API WhatsApp Business
                              </label>
                              <input
                                type="password"
                                value={config.api_token}
                                onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Insira seu token da API"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número do WhatsApp Business
                              </label>
                              <input
                                type="tel"
                                value={config.phone_number}
                                onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="+55 11 99999-9999"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL do Webhook
                              </label>
                              <input
                                type="url"
                                value={config.webhook_url}
                                onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="https://sua-api.com/webhook/whatsapp"
                              />
                            </div>
                            
                            <button
                              onClick={saveConfig}
                              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              Conectar WhatsApp
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-8 h-8 text-emerald-600" />
                              <div>
                                <h4 className="text-lg font-medium text-emerald-900">WhatsApp Conectado</h4>
                                <p className="text-sm text-emerald-700">
                                  Número: {config.phone_number} • Status: Ativo
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">QR Code para Conectar</h5>
                              <div className="bg-gray-100 rounded-lg p-4 text-center">
                                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Escaneie com seu WhatsApp</p>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Configurações Avançadas</h5>
                              <div className="space-y-2">
                                <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1">
                                  Configurar Webhook
                                </button>
                                <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1">
                                  Testar Conexão
                                </button>
                                <button className="w-full text-left text-sm text-red-600 hover:text-red-700 py-1">
                                  Desconectar WhatsApp
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-900 mb-2">Importante</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• Você precisa de uma conta WhatsApp Business verificada</li>
                          <li>• O token da API deve ser obtido no Meta for Developers</li>
                          <li>• Configure o webhook para receber mensagens automaticamente</li>
                          <li>• Mantenha seu número sempre ativo e conectado</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </h3>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    resetTemplateForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do template
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ex: Lembrete de consulta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do template
                  </label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="reminder">Lembrete</option>
                    <option value="confirmation">Confirmação</option>
                    <option value="welcome">Boas-vindas</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={6}
                    value={newTemplate.message}
                    onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Digite a mensagem do template. Use {variavel} para campos dinâmicos."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Variáveis disponíveis: {'{nome}, {horario}, {data}, {profissional}, {clinica}'}
                  </p>
                </div>

                {newTemplate.message && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Variáveis detectadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {extractVariables(newTemplate.message).map((variable, templateVarIndex) => (
                        <span key={`whatsapp-new-template-var-${templateVarIndex}-${variable}`} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowTemplateModal(false);
                      resetTemplateForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingTemplate ? 'Atualizar' : 'Criar'} Template
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
